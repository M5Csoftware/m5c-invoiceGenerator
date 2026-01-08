import { useState, useCallback, useRef, useEffect } from "react";
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  Users,
  Merge,
  Plus,
  Trash2,
  Box,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VoiceInput } from "@/components/VoiceInput";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoiceItemsTable } from "@/components/InvoiceItemsTable";
import { InvoiceHeader, InvoiceItem, AWBEntry } from "@/types/invoice";
import {
  exportToExcel,
  exportMergedExcel,
  exportInvoiceExcel,
} from "@/utils/excelExport";
import { parseVoiceInputWithGemini } from "@/utils/parseVoiceInput";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { UserNav } from "@/components/UserNav";
import { supabase } from "@/integrations/supabase/client";
import {
  getOrCreateRunSession,
  updateSessionHeader,
  addOrUpdateAWBEntry,
  getAllAWBEntries,
  deleteAWBEntry,
  mergeAllAWBEntries,
  getSessionId,
} from "@/services/awbStore";
import { Badge } from "@/components/ui/badge";

const defaultHeader: InvoiceHeader = {
  companyName: "M5C LOGISTICS",
  address: "Bamnoli Dwarka Sector 28",
  eori: "EORI-NL822303474",
  phone: "020-4068040",
  email: "m5csupport@gmail.com",
  countryOfOrigin: "INDIA",
  finalDestination: "CHINA",
  preCarriageBy: "",
  placeOfReceipt: "",
  portOfDischarge: "DEL",
  portOfDestination: "AMS",
  vesselFlightNo: "NA",
  portOfLoading: "IGI DELHI",
};

// Define Box type
interface ShipmentBox {
  id: string;
  boxNo: number;
  grossWt: number;
  netWt: number;
  items: InvoiceItem[];
}

export default function Index() {
  const { user, runNumber } = useAuth();
  const [header, setHeader] = useState<InvoiceHeader>(defaultHeader);
  const [currentAWB, setCurrentAWB] = useState<string>("");
  const [boxCount, setBoxCount] = useState<number>(1);
  const [shipmentBoxes, setShipmentBoxes] = useState<ShipmentBox[]>([]);
  const [currentBox, setCurrentBox] = useState<number>(1);
  const [currentBoxGrossWt, setCurrentBoxGrossWt] = useState<number>(0);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [allAWBEntries, setAllAWBEntries] = useState<AWBEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const lastProcessedTranscript = useRef<string>("");
  const addItemButtonRef = useRef<HTMLButtonElement>(null);
  const [isInputFocusing, setIsInputFocusing] = useState(false);
  const grossWtUpdateTimeout = useRef<NodeJS.Timeout>();

  // Load session data on mount
  useEffect(() => {
    const loadSession = async () => {
      if (!runNumber) return;

      setIsLoading(true);
      const session = await getOrCreateRunSession(runNumber, defaultHeader);

      if (session) {
        setHeader(session.header);
        setAllAWBEntries(session.awbEntries);
        setLastUpdated(session.lastUpdatedAt);

        const id = await getSessionId(runNumber);
        setSessionId(id);

        if (session.awbEntries.length > 0) {
          toast({
            title: "Session Loaded",
            description: `Found ${session.awbEntries.length} AWB entries for Run #${runNumber}`,
          });
        }
      }
      setIsLoading(false);
    };

    loadSession();
  }, [runNumber]);

  // Setup realtime subscription for multi-user sync
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`awb-entries-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "awb_entries",
          filter: `run_session_id=eq.${sessionId}`,
        },
        async (payload) => {
          console.log("Realtime update:", payload);

          if (runNumber) {
            const entries = await getAllAWBEntries(runNumber);
            setAllAWBEntries(entries);
            setLastUpdated(new Date().toISOString());

            // Only update current items if not currently typing
            if (
              currentAWB &&
              payload.new &&
              "awb_no" in payload.new &&
              !isInputFocusing
            ) {
              if (payload.new.awb_no === currentAWB) {
                const newItems = payload.new.items as InvoiceItem[];

                // Rebuild shipment boxes from new items
                const boxesMap = new Map<number, ShipmentBox>();
                newItems.forEach((item) => {
                  const boxNo = parseInt(
                    item.boxId?.replace("Box ", "") || "1"
                  );
                  const boxGrossWt = item.grossWt || 0;
                  const boxNetWt = item.netWt || Math.max(0, boxGrossWt - 2);

                  if (!boxesMap.has(boxNo)) {
                    boxesMap.set(boxNo, {
                      id: crypto.randomUUID(),
                      boxNo,
                      grossWt: boxGrossWt,
                      netWt: boxNetWt,
                      items: [],
                    });
                  }

                  const box = boxesMap.get(boxNo)!;
                  box.items.push(item);
                });

                const boxes = Array.from(boxesMap.values()).sort(
                  (a, b) => a.boxNo - b.boxNo
                );
                setShipmentBoxes(boxes);

                // Update current box items if viewing that box
                const currentBoxData = boxes.find(
                  (box) => box.boxNo === currentBox
                );
                if (currentBoxData) {
                  setItems(currentBoxData.items);
                  setCurrentBoxGrossWt(currentBoxData.grossWt);
                }
              }
            }

            if (
              payload.eventType === "INSERT" ||
              payload.eventType === "UPDATE"
            ) {
              const isOurChange =
                user && payload.new && "created_by" in payload.new
                  ? payload.new.created_by === user.username
                  : false;

              if (!isOurChange) {
                toast({
                  title: "Data Synced",
                  description: "Another user updated the session",
                  duration: 2000,
                });
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, runNumber, currentAWB, currentBox, user, isInputFocusing]);

  // Handle header changes
  const handleHeaderChange = useCallback(
    async (newHeader: InvoiceHeader) => {
      setHeader(newHeader);
      if (runNumber) {
        await updateSessionHeader(runNumber, newHeader);
      }
    },
    [runNumber]
  );

  // Save current box data before switching
  const saveCurrentBoxData = useCallback(() => {
    if (!currentBox || items.length === 0) return shipmentBoxes;

    const updatedBoxes = [...shipmentBoxes];
    const currentBoxIndex = updatedBoxes.findIndex(
      (box) => box.boxNo === currentBox
    );
    const netWt = Math.max(0, currentBoxGrossWt - 2);

    const boxData: ShipmentBox = {
      id:
        currentBoxIndex > -1
          ? updatedBoxes[currentBoxIndex].id
          : crypto.randomUUID(),
      boxNo: currentBox,
      grossWt: currentBoxGrossWt,
      netWt: netWt,
      items: items.map((item) => ({
        ...item,
        boxId: `Box ${currentBox}`,
        grossWt: currentBoxGrossWt,
        netWt: netWt,
      })),
    };

    if (currentBoxIndex > -1) {
      updatedBoxes[currentBoxIndex] = boxData;
    } else {
      updatedBoxes.push(boxData);
    }

    return updatedBoxes.sort((a, b) => a.boxNo - b.boxNo);
  }, [currentBox, currentBoxGrossWt, items, shipmentBoxes]);

  // Handle items changes with debouncing
  const handleItemsChange = useCallback(
    async (newItems: InvoiceItem[], shouldSave = true) => {
      const itemsWithAWB = newItems.map((item) => ({
        ...item,
        awbNo: currentAWB || item.awbNo || "",
        boxId: `Box ${currentBox}`,
        grossWt: currentBoxGrossWt,
        netWt: Math.max(0, currentBoxGrossWt - 2),
      }));

      setItems(itemsWithAWB);

      // Update shipment boxes
      const updatedBoxes = saveCurrentBoxData();
      const currentBoxIndex = updatedBoxes.findIndex(
        (box) => box.boxNo === currentBox
      );

      if (currentBoxIndex > -1) {
        updatedBoxes[currentBoxIndex].items = itemsWithAWB;
      } else {
        updatedBoxes.push({
          id: crypto.randomUUID(),
          boxNo: currentBox,
          grossWt: currentBoxGrossWt,
          netWt: Math.max(0, currentBoxGrossWt - 2),
          items: itemsWithAWB,
        });
      }

      setShipmentBoxes(updatedBoxes);

      // Only save to database if explicitly requested
      if (shouldSave && runNumber && user && currentAWB) {
        const allItems: InvoiceItem[] = [];
        updatedBoxes.forEach((box) => {
          const boxItems = box.items.map((item) => ({
            ...item,
            boxId: `Box ${box.boxNo}`,
            grossWt: box.grossWt,
            netWt: box.netWt,
          }));
          allItems.push(...boxItems);
        });

        await addOrUpdateAWBEntry(
          runNumber,
          currentAWB,
          allItems,
          user.username
        );
      }
    },
    [
      runNumber,
      user,
      currentAWB,
      currentBox,
      currentBoxGrossWt,
      saveCurrentBoxData,
    ]
  );

  // Start or load AWB
  const handleStartAWB = useCallback(async () => {
    if (!currentAWB.trim()) {
      toast({
        title: "AWB Required",
        description: "Please enter an AWB number to start adding items.",
        variant: "destructive",
      });
      return;
    }

    const existingEntry = allAWBEntries.find((e) => e.awbNo === currentAWB);

    if (existingEntry) {
      // Group items by box
      const boxesMap = new Map<number, ShipmentBox>();

      existingEntry.items.forEach((item) => {
        const boxNo = parseInt(item.boxId?.replace("Box ", "") || "1");
        const boxGrossWt = item.grossWt || 0;
        const boxNetWt = item.netWt || Math.max(0, boxGrossWt - 2);

        if (!boxesMap.has(boxNo)) {
          boxesMap.set(boxNo, {
            id: crypto.randomUUID(),
            boxNo,
            grossWt: boxGrossWt,
            netWt: boxNetWt,
            items: [],
          });
        }

        const box = boxesMap.get(boxNo)!;
        box.items.push(item);
      });

      const boxes = Array.from(boxesMap.values()).sort(
        (a, b) => a.boxNo - b.boxNo
      );
      
      // Update box count to match loaded data or user input (whichever is larger)
      const maxBoxNo = Math.max(boxes.length, boxCount);
      setBoxCount(maxBoxNo);
      setShipmentBoxes(boxes);

      // Load first box
      if (boxes.length > 0) {
        setCurrentBox(boxes[0].boxNo);
        setCurrentBoxGrossWt(boxes[0].grossWt);
        setItems(boxes[0].items);
      } else {
        setCurrentBox(1);
        setCurrentBoxGrossWt(0);
        setItems([]);
      }

      toast({
        title: "AWB Loaded",
        description: `Loaded ${boxes.length} boxes with ${existingEntry.items.length} total items (${maxBoxNo} box slots available)`,
      });
    } else {
      // New AWB - respect the user's box count input
      setShipmentBoxes([]);
      setCurrentBox(1);
      setCurrentBoxGrossWt(0);
      setItems([]);
      // Keep the boxCount as entered by user (don't reset to 1)

      toast({
        title: "New AWB Started",
        description: `Ready to add items for AWB ${currentAWB} with ${boxCount} box(es)`,
      });
    }
  }, [currentAWB, allAWBEntries, boxCount]);

  // Delete AWB entry
  const handleDeleteAWB = useCallback(
    async (awbNo: string) => {
      if (!runNumber) return;

      const success = await deleteAWBEntry(runNumber, awbNo);
      if (success) {
        const entries = await getAllAWBEntries(runNumber);
        setAllAWBEntries(entries);

        if (currentAWB === awbNo) {
          setCurrentAWB("");
          setItems([]);
          setCurrentBoxGrossWt(0);
          setShipmentBoxes([]);
          setCurrentBox(1);
          setBoxCount(1);
        }
        toast({
          title: "AWB Deleted",
          description: `AWB ${awbNo} has been removed`,
        });
      }
    },
    [runNumber, currentAWB]
  );

  // Handle voice input transcription
  const handleTranscriptComplete = useCallback(
    async (transcript: string) => {
      if (!transcript.trim() || isProcessing) return;
      if (!currentAWB) {
        toast({
          title: "AWB Required",
          description: "Please enter an AWB number first before adding items.",
          variant: "destructive",
        });
        return;
      }
      if (lastProcessedTranscript.current === transcript) return;
      lastProcessedTranscript.current = transcript;

      setIsProcessing(true);

      try {
        const parsedItems = await parseVoiceInputWithGemini(transcript);

        if (parsedItems.length > 0) {
          const itemsMap = new Map<string, InvoiceItem>();

          // Add existing items to map
          items.forEach((item) => {
            const key = item.description.toUpperCase().trim();
            if (itemsMap.has(key)) {
              const existing = itemsMap.get(key)!;
              existing.quantity += item.quantity;
            } else {
              itemsMap.set(key, { ...item });
            }
          });

          // Add new items to map
          const netWt = Math.max(0, currentBoxGrossWt - 2);
          parsedItems.forEach((item) => {
            const key = item.description.toUpperCase().trim();
            if (itemsMap.has(key)) {
              const existing = itemsMap.get(key)!;
              existing.quantity += item.quantity;
            } else {
              itemsMap.set(key, {
                ...item,
                id: crypto.randomUUID(),
                sNo: 0,
                awbNo: currentAWB,
                grossWt: currentBoxGrossWt,
                netWt: netWt,
                boxId: `Box ${currentBox}`,
              });
            }
          });

          // Convert map back to array and renumber
          const updatedItems = Array.from(itemsMap.values()).map(
            (item, index) => ({
              ...item,
              sNo: index + 1,
              awbNo: currentAWB,
              boxId: `Box ${currentBox}`,
              grossWt: currentBoxGrossWt,
              netWt: netWt,
            })
          );

          // Use handleItemsChange to properly save
          await handleItemsChange(updatedItems, true);

          toast({
            title: "Items Added",
            description: `Added ${parsedItems.length} items to Box ${currentBox} (duplicates merged)`,
          });
        } else {
          toast({
            title: "No items recognized",
            description: "Could not parse any products from the voice input.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error processing voice input:", error);
        toast({
          title: "Error",
          description: "Failed to process voice input. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [
      items,
      currentAWB,
      currentBoxGrossWt,
      currentBox,
      isProcessing,
      handleItemsChange,
    ]
  );

  // Handle box count change
  const handleBoxCountChange = (count: number) => {
    if (count < 1) count = 1;
    setBoxCount(count);
  };

  // Handle box selection - FIXED VERSION
  const handleBoxSelect = useCallback(
    (boxNo: number) => {
      // Save current box data first
      const updatedBoxes = saveCurrentBoxData();
      setShipmentBoxes(updatedBoxes);

      // Now switch to the selected box
      const selectedBox = updatedBoxes.find((box) => box.boxNo === boxNo);

      if (selectedBox) {
        // Load existing box data
        setCurrentBox(selectedBox.boxNo);
        setCurrentBoxGrossWt(selectedBox.grossWt);
        setItems(selectedBox.items);

        toast({
          title: "Box Loaded",
          description: `Switched to Box ${boxNo} with ${selectedBox.items.length} items`,
          duration: 2000,
        });
      } else {
        // Create new empty box
        setCurrentBox(boxNo);
        setCurrentBoxGrossWt(0);
        setItems([]);

        toast({
          title: "New Box",
          description: `Ready to add items to Box ${boxNo}`,
          duration: 2000,
        });
      }
    },
    [saveCurrentBoxData]
  );

  // Update box gross weight - CORRECTED VERSION
  const handleBoxGrossWtChange = useCallback(
    (value: string) => {
      // Parse the value, allowing empty string
      const grossWt = value === "" ? 0 : parseFloat(value) || 0;

      // Update local state immediately for responsive UI
      setCurrentBoxGrossWt(grossWt);
      const netWt = Math.max(0, grossWt - 2);

      // Update current items with new weights (local state only)
      const updatedItems = items.map((item) => ({
        ...item,
        grossWt,
        netWt,
      }));
      setItems(updatedItems);

      // Update the box in shipmentBoxes (local state only)
      const updatedBoxes = [...shipmentBoxes];
      const boxIndex = updatedBoxes.findIndex(
        (box) => box.boxNo === currentBox
      );

      if (boxIndex > -1) {
        updatedBoxes[boxIndex] = {
          ...updatedBoxes[boxIndex],
          grossWt,
          netWt,
          items: updatedItems,
        };
      } else {
        updatedBoxes.push({
          id: crypto.randomUUID(),
          boxNo: currentBox,
          grossWt,
          netWt,
          items: updatedItems,
        });
      }

      setShipmentBoxes(updatedBoxes.sort((a, b) => a.boxNo - b.boxNo));

      // Debounce database update
      if (grossWtUpdateTimeout.current) {
        clearTimeout(grossWtUpdateTimeout.current);
      }

      grossWtUpdateTimeout.current = setTimeout(() => {
        if (runNumber && user && currentAWB && grossWt > 0) {
          const allItems: InvoiceItem[] = [];
          updatedBoxes.forEach((box) => {
            const boxItems = box.items.map((item) => ({
              ...item,
              boxId: `Box ${box.boxNo}`,
              grossWt: box.grossWt,
              netWt: box.netWt,
            }));
            allItems.push(...boxItems);
          });

          addOrUpdateAWBEntry(runNumber, currentAWB, allItems, user.username);
        }
      }, 1000);
    },
    [items, shipmentBoxes, currentBox, runNumber, user, currentAWB]
  );

  // Handle input focus/blur for realtime sync
  const handleInputFocus = () => setIsInputFocusing(true);
  const handleInputBlur = () => setIsInputFocusing(false);

  // Export current AWB to Excel
  const handleExportCurrent = () => {
    if (!currentAWB || shipmentBoxes.length === 0) {
      toast({
        title: "No Items",
        description: "Please select an AWB and add items before exporting.",
        variant: "destructive",
      });
      return;
    }

    try {
      const allItems: InvoiceItem[] = [];
      shipmentBoxes.forEach((box) => {
        const boxItems = box.items.map((item) => ({
          ...item,
          boxId: `Box ${box.boxNo}`,
          grossWt: box.grossWt,
          netWt: box.netWt,
        }));
        allItems.push(...boxItems);
      });

      exportToExcel(header, allItems, `AWB_${currentAWB}`, currentAWB);
      toast({
        title: "Export Successful",
        description: `AWB ${currentAWB} exported to Excel.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Merge all AWBs and export
  const handleMergeAndExport = async () => {
    if (!runNumber || allAWBEntries.length === 0) {
      toast({
        title: "No AWB Entries",
        description: "Please add at least one AWB entry before merging.",
        variant: "destructive",
      });
      return;
    }

    try {
      const mergedItems = await mergeAllAWBEntries(runNumber);
      exportMergedExcel(header, allAWBEntries, `MERGED_RUN_${runNumber}`);
      toast({
        title: "Merge Successful",
        description: `Merged ${allAWBEntries.length} AWB entries (${mergedItems.length} items) to Excel.`,
      });
    } catch (error) {
      toast({
        title: "Merge Failed",
        description: "Failed to merge and export. Please try again.",
        variant: "destructive",
      });
    }
  };
  const getBoxCount = (items: InvoiceItem[]): number => {
    const uniqueBoxes = new Set<string>();
    items.forEach((item) => {
      if (item.boxId) {
        uniqueBoxes.add(item.boxId);
      }
    });
    return uniqueBoxes.size || 1; // Return 1 if no boxes found
  };

  // Export invoice format
  const handleInvoiceExport = async () => {
    if (!runNumber || allAWBEntries.length === 0) {
      toast({
        title: "No AWB Entries",
        description:
          "Please add at least one AWB entry before exporting invoice.",
        variant: "destructive",
      });
      return;
    }

    try {
      exportInvoiceExcel(header, allAWBEntries, `INVOICE_RUN_${runNumber}`);
      toast({
        title: "Invoice Export Successful",
        description: `Created invoice with ${allAWBEntries.length} AWB entries (items grouped by description).`,
      });
    } catch (error) {
      toast({
        title: "Invoice Export Failed",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (grossWtUpdateTimeout.current) {
        clearTimeout(grossWtUpdateTimeout.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading session data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground hidden md:block">
                Voice Invoice Generator
              </h1>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] px-1.5 py-0"
                >
                  RUN: {runNumber}
                </Badge>
                {currentAWB && (
                  <Badge
                    variant="secondary"
                    className="font-mono text-[10px] px-1.5 py-0"
                  >
                    AWB: {currentAWB}
                  </Badge>
                )}
                {currentAWB && shipmentBoxes.length > 0 && (
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] px-1.5 py-0"
                  >
                    BOXES: {shipmentBoxes.length}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {allAWBEntries.length > 1 ? (
              <>
                <Button
                  onClick={handleMergeAndExport}
                  variant="secondary"
                  className="gap-2 hidden sm:flex h-8 text-xs"
                  size="sm"
                >
                  <Merge className="h-3.5 w-3.5" />
                  Merge All ({allAWBEntries.length})
                </Button>
                <Button
                  onClick={handleInvoiceExport}
                  variant="outline"
                  className="gap-2 hidden sm:flex h-8 text-xs"
                  size="sm"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Invoice Excel
                </Button>
              </>
            ) : allAWBEntries.length === 1 ? (
              <Button
                onClick={handleExportCurrent}
                className="gap-2 hidden sm:flex h-8 text-xs"
                disabled={!currentAWB || shipmentBoxes.length === 0}
                size="sm"
              >
                <Download className="h-3.5 w-3.5" />
                Export AWB
              </Button>
            ) : null}
            <UserNav />
          </div>
        </div>
      </header>

      <main className="container py-6 max-w-[1800px]">
        {/* Sync Status Banner */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-900 rounded-xl p-3 flex items-center justify-between text-sm text-green-700 dark:text-green-300 mb-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              <strong>Cloud Sync Active</strong> • Run #{runNumber} •{" "}
              {allAWBEntries.length} AWB entries
            </span>
          </div>
          {lastUpdated && (
            <span className="text-xs opacity-75">
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* SPLIT LAYOUT: Left (1/3 width) | Right (2/3 width) */}
        <div className="grid lg:grid-cols-12 gap-6 p-4">
          {/* ==================== LEFT SIDE (4 columns out of 12) ==================== */}
          <div className="lg:col-span-4 space-y-6">
            {/* AWB Selection with Box Functionality */}
            <Card className="border-primary/20 shadow-sm">
              <CardHeader className="pb-4 space-y-3">
                {/* AWB List */}
                {allAWBEntries.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground">
                      All AWB Entries ({allAWBEntries.length})
                    </Label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-muted/30 rounded-lg border">
                      {allAWBEntries.map((entry) => {
                        const boxCount = getBoxCount(entry.items);
                        return (
                          <div
                            key={entry.awbNo}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] cursor-pointer transition-all hover:scale-105 ${
                              currentAWB === entry.awbNo
                                ? "bg-primary text-primary-foreground border-primary shadow-md"
                                : "bg-card hover:bg-muted/50 border-border hover:border-primary/50"
                            }`}
                            onClick={() => {
                              setCurrentAWB(entry.awbNo);
                              handleStartAWB();
                            }}
                          >
                            <span className="font-mono font-bold text-[11px]">
                              {entry.awbNo}
                            </span>
                            <Badge
                              variant={
                                currentAWB === entry.awbNo
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-[9px] px-1.5 h-4"
                            >
                              {entry.items.length}
                            </Badge>
                            <Badge
                              variant={
                                currentAWB === entry.awbNo
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-[9px] px-1.5 h-4"
                            >
                              {boxCount}B
                            </Badge>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAWB(entry.awbNo);
                              }}
                              className="ml-1 p-0.5 rounded hover:bg-destructive/20 hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Separator className="my-3" />

                <div className="space-y-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Box className="h-4 w-4 text-primary" />
                    AWB Entry & Box Management
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Enter AWB number and manage shipment boxes
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* AWB Number Input */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="awb-input" className="text-xs font-medium">
                      AWB Number
                    </Label>
                    <Input
                      id="awb-input"
                      placeholder="Enter AWB (e.g., ABC123)"
                      value={currentAWB}
                      onChange={(e) =>
                        setCurrentAWB(e.target.value.toUpperCase())
                      }
                      className="font-mono h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="box-count-input"
                      className="text-xs font-medium"
                    >
                      Total Boxes
                    </Label>
                    <Input
                      id="box-count-input"
                      type="number"
                      min="1"
                      placeholder="Enter number of boxes"
                      value={boxCount}
                      onChange={(e) =>
                        handleBoxCountChange(parseInt(e.target.value) || 1)
                      }
                      className="font-mono h-10 text-sm"
                    />
                  </div>

                  <Button
                    onClick={handleStartAWB}
                    className="w-full gap-2 h-10 text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Load/Start AWB
                  </Button>
                </div>

                {/* Box Selection Buttons */}
                {currentAWB && boxCount > 0 && (
                  <div className="space-y-4 pt-2">
                    <Separator />

                    <div className="space-y-3">
                      <Label className="text-xs font-semibold flex items-center gap-2">
                        <Box className="h-3.5 w-3.5 text-primary" />
                        Select Box to Work On
                      </Label>

                      <div className="grid grid-cols-5 gap-2">
                        {Array.from({ length: boxCount }, (_, i) => i + 1).map(
                          (boxNo) => {
                            const box = shipmentBoxes.find(
                              (b) => b.boxNo === boxNo
                            );
                            const isActive = currentBox === boxNo;
                            const hasItems = box && box.items.length > 0;

                            return (
                              <Button
                                key={boxNo}
                                onClick={() => handleBoxSelect(boxNo)}
                                variant={isActive ? "default" : "outline"}
                                className={`h-auto py-2.5 flex flex-col gap-1.5 transition-all hover:scale-105 ${
                                  isActive
                                    ? "ring-2 ring-primary ring-offset-2 shadow-lg"
                                    : "hover:border-primary/50"
                                }`}
                                size="sm"
                              >
                                <div
                                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                    isActive
                                      ? "bg-primary-foreground text-primary"
                                      : "bg-muted"
                                  }`}
                                >
                                  {boxNo}
                                </div>
                                {hasItems && (
                                  <Badge
                                    variant={isActive ? "secondary" : "outline"}
                                    className="text-[9px] px-1.5 h-4"
                                  >
                                    {box.items.length}
                                  </Badge>
                                )}
                                {box && box.grossWt > 0 && (
                                  <span className="text-[9px] opacity-70 font-mono">
                                    {box.grossWt.toFixed(1)}kg
                                  </span>
                                )}
                              </Button>
                            );
                          }
                        )}
                      </div>
                    </div>

                    {/* Current Box Gross Weight Input */}
                    {currentBox > 0 && (
                      <>
                        <Separator />
                        <div className="bg-gradient-to-br from-muted/40 to-muted/20 p-4 rounded-lg space-y-3 border border-border">
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="current-box-gross-wt"
                              className="text-xs font-semibold"
                            >
                              Gross Weight - Box {currentBox}
                            </Label>
                            <Badge
                              variant="outline"
                              className="font-mono text-[10px] px-2 h-5"
                            >
                              Net:{" "}
                              {Math.max(0, currentBoxGrossWt - 2).toFixed(2)} kg
                            </Badge>
                          </div>
                          <Input
                            id="current-box-gross-wt"
                            type="number"
                            step="0.01"
                            placeholder="Enter weight in kg"
                            value={currentBoxGrossWt || ""}
                            onChange={(e) =>
                              handleBoxGrossWtChange(e.target.value)
                            }
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            className="font-mono h-10 text-sm"
                          />
                        </div>
                      </>
                    )}

                    {/* Current Box Summary */}
                    {currentBox > 0 && currentAWB && (
                      <>
                        <Separator />
                        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 p-4 rounded-lg shadow-sm">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                              Currently Working On
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="space-y-1">
                                <p className="text-muted-foreground font-medium">
                                  AWB Number
                                </p>
                                <p className="font-mono font-bold text-sm">
                                  {currentAWB}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-muted-foreground font-medium">
                                  Box Number
                                </p>
                                <p className="font-mono font-bold text-sm">
                                  {currentBox}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-muted-foreground font-medium">
                                  Items Count
                                </p>
                                <p className="font-mono font-bold text-sm">
                                  {items.length}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-muted-foreground font-medium">
                                  Gross Weight
                                </p>
                                <p className="font-mono font-bold text-sm">
                                  {currentBoxGrossWt.toFixed(2)} kg
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Voice Input Section */}
            {currentAWB && currentBox > 0 && (
              <Card className="border-primary/20 shadow-sm">
                <CardHeader className="pb-4 space-y-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                    Voice Input
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Speak to add items to Box {currentBox}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <VoiceInput
                    onTranscriptComplete={handleTranscriptComplete}
                    disabled={isProcessing}
                  />
                  {isProcessing && (
                    <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-xs text-primary font-medium flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Processing voice input with AI...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* ==================== RIGHT SIDE (8 columns out of 12) ==================== */}
          <div className="lg:col-span-8 space-y-6">
            {/* Items Table */}
            {currentAWB && currentBox > 0 ? (
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">Items Table</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        AWB:{" "}
                        <span className="font-mono font-semibold">
                          {currentAWB}
                        </span>{" "}
                        • Box:{" "}
                        <span className="font-mono font-semibold">
                          {currentBox}
                        </span>{" "}
                        • {items.length} items
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="font-mono text-xs px-3 h-7"
                    >
                      Total Qty:{" "}
                      {items.reduce(
                        (sum, item) => sum + (Number(item.quantity) || 0),
                        0
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <InvoiceItemsTable
                    items={items}
                    onItemsChange={handleItemsChange}
                    currentAWB={currentAWB}
                    currentGrossWt={currentBoxGrossWt}
                    onGrossWtChange={handleBoxGrossWtChange}
                    onInputFocus={handleInputFocus}
                    onInputBlur={handleInputBlur}
                    addItemButtonRef={addItemButtonRef}
                    currentBox={currentBox}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="p-16 text-center border-2 border-dashed shadow-sm">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center">
                      <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      No Active Shipment
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Enter an AWB number and select a box to start adding items
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Shipment Boxes Summary Table */}
            {shipmentBoxes.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Box className="h-5 w-5 text-primary" />
                      Shipment Boxes Summary
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {shipmentBoxes.length} boxes •{" "}
                      {shipmentBoxes.reduce(
                        (sum, box) => sum + box.items.length,
                        0
                      )}{" "}
                      total items
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          <th className="text-left p-4 font-semibold text-xs">
                            Box
                          </th>
                          <th className="text-right p-4 font-semibold text-xs">
                            Gross WT (kg)
                          </th>
                          <th className="text-right p-4 font-semibold text-xs">
                            Net WT (kg)
                          </th>
                          <th className="text-right p-4 font-semibold text-xs">
                            Items
                          </th>
                          <th className="text-center p-4 font-semibold text-xs">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {shipmentBoxes
                          .sort((a, b) => a.boxNo - b.boxNo)
                          .map((box) => (
                            <tr
                              key={box.id}
                              className={`border-b transition-colors ${
                                currentBox === box.boxNo
                                  ? "bg-primary/5"
                                  : "hover:bg-muted/30"
                              }`}
                            >
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                                      currentBox === box.boxNo
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                    }`}
                                  >
                                    {box.boxNo}
                                  </div>
                                  <span className="font-medium text-sm">
                                    Box {box.boxNo}
                                  </span>
                                  {currentBox === box.boxNo && (
                                    <Badge
                                      variant="default"
                                      className="text-[10px] px-2"
                                    >
                                      Active
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-right font-mono text-sm font-semibold">
                                {box.grossWt.toFixed(2)}
                              </td>
                              <td className="p-4 text-right font-mono text-sm">
                                {box.netWt.toFixed(2)}
                              </td>
                              <td className="p-4 text-right">
                                <Badge
                                  variant="outline"
                                  className="text-xs px-2"
                                >
                                  {box.items.length} items
                                </Badge>
                              </td>
                              <td className="p-4 text-center">
                                <Button
                                  variant={
                                    currentBox === box.boxNo
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() => handleBoxSelect(box.boxNo)}
                                  className="h-9 text-xs px-4"
                                >
                                  {currentBox === box.boxNo
                                    ? "✓ Selected"
                                    : "Select"}
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Invoice Details */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Invoice Details</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Company and shipment information
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <InvoiceForm header={header} onChange={handleHeaderChange} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Export Buttons */}
        <div className="flex flex-col gap-3 sm:hidden mt-6">
          {allAWBEntries.length > 1 ? (
            <>
              <Button
                onClick={handleMergeAndExport}
                size="lg"
                variant="secondary"
                className="w-full gap-2"
              >
                <Merge className="h-5 w-5" />
                Merge All AWBs ({allAWBEntries.length})
              </Button>
              <Button
                onClick={handleInvoiceExport}
                size="lg"
                variant="outline"
                className="w-full gap-2"
              >
                <FileSpreadsheet className="h-5 w-5" />
                Invoice Excel
              </Button>
            </>
          ) : allAWBEntries.length === 1 ? (
            <Button
              onClick={handleExportCurrent}
              size="lg"
              className="w-full gap-2"
              disabled={!currentAWB || shipmentBoxes.length === 0}
            >
              <Download className="h-5 w-5" />
              Export Current AWB
            </Button>
          ) : null}
        </div>
      </main>

      <footer className="border-t py-4 mt-8 bg-muted/10">
        <div className="container text-center text-xs text-muted-foreground">
          <p>
            Voice Invoice Generator • Run #{runNumber} • Logged in as{" "}
            {user?.name}
          </p>
        </div>
      </footer>
    </div>
  );
}
