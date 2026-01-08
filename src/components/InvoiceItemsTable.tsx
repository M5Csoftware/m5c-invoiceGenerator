import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceItem } from "@/types/invoice";
import { useCallback, useState, useEffect, useRef } from "react";
import DescriptionInput from "./DescriptionInput";
import { CardTitle } from "./ui/card";

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  onItemsChange: (items: InvoiceItem[], shouldSave?: boolean) => void;
  currentAWB?: string;
  currentGrossWt?: number;
  onGrossWtChange?: (value: string) => void; // Changed to accept string
  onInputFocus?: () => void;
  onInputBlur?: () => void;
  addItemButtonRef?: React.RefObject<HTMLButtonElement>;
  currentBox?: number;
}

export function InvoiceItemsTable({
  items,
  onItemsChange,
  currentAWB,
  currentGrossWt = 0,
  onGrossWtChange,
  onInputFocus,
  onInputBlur,
  addItemButtonRef,
  currentBox = 1,
}: InvoiceItemsTableProps) {
  const [localItems, setLocalItems] = useState<InvoiceItem[]>(items);
  const [localGrossWt, setLocalGrossWt] = useState(currentGrossWt);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  // Sync local items when props change (but only if not currently editing)
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // Sync gross weight when props change
  useEffect(() => {
    setLocalGrossWt(currentGrossWt);
  }, [currentGrossWt]);

  const addItem = useCallback(() => {
    const netWt = Math.max(0, localGrossWt - 2);
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      sNo: localItems.length + 1,
      grossWt: localGrossWt,
      netWt: netWt,
      description: "",
      dimensionL: 0,
      dimensionB: 0,
      dimensionH: 0,
      hsnCode: "",
      quantity: 1,
      awbNo: currentAWB || "",
      boxId: `Box ${currentBox}`,
    };

    const updatedItems = [...localItems, newItem].map((item, index) => ({
      ...item,
      sNo: index + 1,
      awbNo: currentAWB || item.awbNo || "",
      grossWt: localGrossWt,
      netWt: netWt,
      boxId: `Box ${currentBox}`,
    }));

    setLocalItems(updatedItems);
    onItemsChange(updatedItems, true); // Save to database
  }, [localItems, localGrossWt, onItemsChange, currentAWB, currentBox]);

  const removeItem = useCallback(
    (id: string) => {
      const netWt = Math.max(0, localGrossWt - 2);
      const updatedItems = localItems
        .filter((item) => item.id !== id)
        .map((item, index) => ({
          ...item,
          sNo: index + 1,
          grossWt: localGrossWt,
          netWt: netWt,
          boxId: `Box ${currentBox}`,
        }));

      setLocalItems(updatedItems);
      onItemsChange(updatedItems, true); // Save to database
    },
    [localItems, localGrossWt, onItemsChange, currentBox]
  );

  const updateItem = useCallback(
    (id: string, field: keyof InvoiceItem, value: string | number) => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      setLocalItems((prev) => {
        const updatedItems = prev.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        );

        // Don't save to database immediately while typing (debounce)
        updateTimeoutRef.current = setTimeout(() => {
          onItemsChange(updatedItems, true);
        }, 1000);

        return updatedItems;
      });
    },
    [onItemsChange]
  );

  // Handle keyboard navigation for adding items
  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLInputElement>,
      itemId: string,
      field: keyof InvoiceItem
    ) => {
      // Check if Tab key is pressed on the last field (quantity) of the last item
      if (e.key === "Tab" && !e.shiftKey && field === "quantity") {
        const itemIndex = localItems.findIndex((item) => item.id === itemId);
        const isLastItem = itemIndex === localItems.length - 1;

        if (isLastItem) {
          e.preventDefault();
          addItem();
          // Focus will naturally move to the first field of the new row
          setTimeout(() => {
            // Find the first input in the newly added row
            const newRowInputs = document.querySelectorAll(
              `[data-item-row]:last-child input:not([disabled])`
            );
            if (newRowInputs.length > 0) {
              (newRowInputs[0] as HTMLInputElement).focus();
            }
          }, 100);
        }
      }
    },
    [localItems, addItem]
  );

  // Handle product selection from autocomplete
  const handleProductSelect = useCallback(
    (id: string, product: { name: string; hsnCode: string }) => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      setLocalItems((prev) => {
        const updatedItems = prev.map((item) =>
          item.id === id
            ? {
                ...item,
                description: product.name,
                hsnCode: product.hsnCode,
              }
            : item
        );

        // Save immediately when product is selected
        onItemsChange(updatedItems, true);
        return updatedItems;
      });
    },
    [onItemsChange]
  );

  // Handle gross weight change - FIXED to accept string and pass to parent
  const handleGrossWtChange = (value: string) => {
    // Parse for local display
    const parsedValue = value === "" ? 0 : parseFloat(value) || 0;
    const newGrossWt = Math.max(0, parsedValue);
    const netWt = Math.max(0, newGrossWt - 2);

    setLocalGrossWt(newGrossWt);

    // Update all items with new weights (local state only)
    const updatedItems = localItems.map((item) => ({
      ...item,
      grossWt: newGrossWt,
      netWt: netWt,
    }));

    setLocalItems(updatedItems);

    // Pass the string value to parent (which handles debouncing and saving)
    if (onGrossWtChange) {
      onGrossWtChange(value);
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Handle input focus
  const handleInputFocus = () => {
    if (onInputFocus) onInputFocus();
  };

  // Handle input blur
  const handleInputBlur = () => {
    if (onInputBlur) onInputBlur();
  };

  // Calculate totals
  const totals = {
    grossWt: localGrossWt,
    netWt: Math.max(0, localGrossWt - 2),
    quantity: localItems.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0),
      0
    ),
  };

  return (
    <div className="space-y-4">
      <div className="pl-5">
         <h3 className="text-lg font-semibold">
            Items for Box {currentBox} ({localItems.length})
          </h3> 
        
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[50px] text-center">S No.</TableHead>
                <TableHead className="w-24">AWB No.</TableHead>
                <TableHead className="w-32">Box ID</TableHead>
                <TableHead className="w-28 ">Gross WT</TableHead>
                <TableHead className="w-28 ">Net WT</TableHead>
                <TableHead className="min-w-[180px]">Description</TableHead>
                <TableHead className="w-16 text-center">L</TableHead>
                <TableHead className="w-16 text-center">B</TableHead>
                <TableHead className="w-16 text-center">H</TableHead>
                <TableHead className="w-28">HSN Code</TableHead>
                <TableHead className="w-28">Qty</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={12}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No items added. Click "Add Item" below or use voice input to
                    add items.
                  </TableCell>
                </TableRow>
              ) : (
                localItems.map((item) => (
                  <TableRow key={item.id} data-item-row>
                    <TableCell className="text-center font-medium text-muted-foreground">
                      {item.sNo}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.awbNo || currentAWB || ""}
                        onChange={(e) =>
                          updateItem(item.id, "awbNo", e.target.value)
                        }
                        className="h-8 text-sm font-mono"
                        placeholder="AWB"
                        disabled
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={`Box ${currentBox}`}
                        className="h-8 text-sm font-mono bg-muted/50"
                        disabled
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={localGrossWt || ""}
                        onChange={(e) => handleGrossWtChange(e.target.value)}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="h-8 text-sm text-right font-mono"
                        placeholder="0.00"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={Math.max(0, localGrossWt - 2) || ""}
                        className="h-8 text-sm text-right bg-muted/50 font-mono"
                        placeholder="0.00"
                        disabled
                        title="Gross Weight - 2 kg"
                      />
                    </TableCell>
                    <TableCell>
                      <DescriptionInput
                        value={item.description}
                        onChange={(value) =>
                          updateItem(item.id, "description", value)
                        }
                        onProductSelect={(product) =>
                          handleProductSelect(item.id, product)
                        }
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        itemId={item.id}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={item.dimensionL || ""}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "dimensionL",
                            parseInt(e.target.value) || 0
                          )
                        }
                        onKeyDown={(e) =>
                          handleKeyDown(e, item.id, "dimensionL")
                        }
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="h-8 text-sm text-center"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={item.dimensionB || ""}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "dimensionB",
                            parseInt(e.target.value) || 0
                          )
                        }
                        onKeyDown={(e) =>
                          handleKeyDown(e, item.id, "dimensionB")
                        }
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="h-8 text-sm text-center"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={item.dimensionH || ""}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "dimensionH",
                            parseInt(e.target.value) || 0
                          )
                        }
                        onKeyDown={(e) =>
                          handleKeyDown(e, item.id, "dimensionH")
                        }
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="h-8 text-sm text-center"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.hsnCode}
                        onChange={(e) =>
                          updateItem(item.id, "hsnCode", e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, item.id, "hsnCode")}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="h-8 text-sm"
                        placeholder="HSN"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity || ""}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "quantity",
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        onKeyDown={(e) => handleKeyDown(e, item.id, "quantity")}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="h-8 text-sm text-right"
                        placeholder="1"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 hover:text-destructive"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {localItems.length > 0 && (
                <TableRow className="bg-muted/30 font-semibold">
                  <TableCell colSpan={3} className="text-right">
                    TOTAL:
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {totals.grossWt.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {totals.netWt.toFixed(2)}
                  </TableCell>
                  <TableCell colSpan={5}></TableCell>
                  <TableCell className="text-right font-mono">
                    {totals.quantity}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
              <TableRow className="bg-primary/5 hover:bg-primary/10">
                <TableCell colSpan={12} className="text-center py-3">
                  <Button
                    ref={addItemButtonRef}
                    onClick={addItem}
                    size="sm"
                    className="gap-2"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item (or press Tab on last field)
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
