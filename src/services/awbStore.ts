import { supabase } from '@/integrations/supabase/client';
import { InvoiceHeader, InvoiceItem, AWBEntry, RunSessionData } from '@/types/invoice';
import { Json } from '@/integrations/supabase/types';

// Get or create run session
export const getOrCreateRunSession = async (runNumber: string, defaultHeader: InvoiceHeader): Promise<RunSessionData | null> => {
  try {
    // First try to get existing session
    const { data: existing, error: fetchError } = await supabase
      .from('run_sessions')
      .select('*')
      .eq('run_number', runNumber)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching run session:', fetchError);
      return null;
    }

    if (existing) {
      // Get AWB entries for this session
      const { data: awbData, error: awbError } = await supabase
        .from('awb_entries')
        .select('*')
        .eq('run_session_id', existing.id)
        .order('created_at', { ascending: true });

      if (awbError) {
        console.error('Error fetching AWB entries:', awbError);
      }

      const awbEntries: AWBEntry[] = (awbData || []).map(entry => ({
        awbNo: entry.awb_no,
        items: (entry.items as unknown as InvoiceItem[]) || [],
        createdBy: entry.created_by,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at
      }));

      return {
        runNumber: existing.run_number,
        header: (existing.header as unknown as InvoiceHeader) || defaultHeader,
        awbEntries,
        lastUpdatedAt: existing.updated_at
      };
    }

    // Create new session
    const { data: newSession, error: createError } = await supabase
      .from('run_sessions')
      .insert({
        run_number: runNumber,
        header: defaultHeader as unknown as Json
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating run session:', createError);
      return null;
    }

    return {
      runNumber: newSession.run_number,
      header: (newSession.header as unknown as InvoiceHeader) || defaultHeader,
      awbEntries: [],
      lastUpdatedAt: newSession.updated_at
    };
  } catch (error) {
    console.error('Error in getOrCreateRunSession:', error);
    return null;
  }
};

// Update session header
export const updateSessionHeader = async (runNumber: string, header: InvoiceHeader): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('run_sessions')
      .update({ header: header as unknown as Json })
      .eq('run_number', runNumber);

    if (error) {
      console.error('Error updating header:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in updateSessionHeader:', error);
    return false;
  }
};

// Add or update AWB entry
export const addOrUpdateAWBEntry = async (
  runNumber: string,
  awbNo: string,
  items: InvoiceItem[],
  username: string
): Promise<AWBEntry | null> => {
  try {
    // Get session ID
    const { data: session, error: sessionError } = await supabase
      .from('run_sessions')
      .select('id')
      .eq('run_number', runNumber)
      .single();

    if (sessionError || !session) {
      console.error('Error finding session:', sessionError);
      return null;
    }

    // Check if AWB entry exists
    const { data: existing } = await supabase
      .from('awb_entries')
      .select('id')
      .eq('run_session_id', session.id)
      .eq('awb_no', awbNo)
      .maybeSingle();

    if (existing) {
      // Update existing
      const { data: updated, error: updateError } = await supabase
        .from('awb_entries')
        .update({ 
          items: items as unknown as Json,
          created_by: username 
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating AWB entry:', updateError);
        return null;
      }

      return {
        awbNo: updated.awb_no,
        items: (updated.items as unknown as InvoiceItem[]) || [],
        createdBy: updated.created_by,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at
      };
    } else {
      // Create new
      const { data: created, error: createError } = await supabase
        .from('awb_entries')
        .insert({
          run_session_id: session.id,
          awb_no: awbNo,
          items: items as unknown as Json,
          created_by: username
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating AWB entry:', createError);
        return null;
      }

      return {
        awbNo: created.awb_no,
        items: (created.items as unknown as InvoiceItem[]) || [],
        createdBy: created.created_by,
        createdAt: created.created_at,
        updatedAt: created.updated_at
      };
    }
  } catch (error) {
    console.error('Error in addOrUpdateAWBEntry:', error);
    return null;
  }
};

// Get all AWB entries for a run
export const getAllAWBEntries = async (runNumber: string): Promise<AWBEntry[]> => {
  try {
    const { data: session } = await supabase
      .from('run_sessions')
      .select('id')
      .eq('run_number', runNumber)
      .maybeSingle();

    if (!session) return [];

    const { data, error } = await supabase
      .from('awb_entries')
      .select('*')
      .eq('run_session_id', session.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching AWB entries:', error);
      return [];
    }

    return (data || []).map(entry => ({
      awbNo: entry.awb_no,
      items: (entry.items as unknown as InvoiceItem[]) || [],
      createdBy: entry.created_by,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at
    }));
  } catch (error) {
    console.error('Error in getAllAWBEntries:', error);
    return [];
  }
};

// Delete AWB entry
export const deleteAWBEntry = async (runNumber: string, awbNo: string): Promise<boolean> => {
  try {
    const { data: session } = await supabase
      .from('run_sessions')
      .select('id')
      .eq('run_number', runNumber)
      .maybeSingle();

    if (!session) return false;

    const { error } = await supabase
      .from('awb_entries')
      .delete()
      .eq('run_session_id', session.id)
      .eq('awb_no', awbNo);

    if (error) {
      console.error('Error deleting AWB entry:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in deleteAWBEntry:', error);
    return false;
  }
};

// Merge all AWB entries into consolidated items
export const mergeAllAWBEntries = async (runNumber: string): Promise<InvoiceItem[]> => {
  const entries = await getAllAWBEntries(runNumber);
  
  // Aggregate items by description
  const itemMap = new Map<string, InvoiceItem>();
  
  entries.forEach(entry => {
    entry.items.forEach(item => {
      const key = item.description.toUpperCase().trim();
      if (itemMap.has(key)) {
        const existing = itemMap.get(key)!;
        existing.quantity += item.quantity;
        existing.grossWt += item.grossWt;
        existing.netWt += item.netWt;
      } else {
        itemMap.set(key, { ...item, id: crypto.randomUUID() });
      }
    });
  });

  // Convert to array, sort, and assign S.No
  const mergedItems = Array.from(itemMap.values())
    .sort((a, b) => a.description.localeCompare(b.description))
    .map((item, index) => ({ ...item, sNo: index + 1 }));

  return mergedItems;
};

// Get session ID for realtime subscription
export const getSessionId = async (runNumber: string): Promise<string | null> => {
  const { data } = await supabase
    .from('run_sessions')
    .select('id')
    .eq('run_number', runNumber)
    .maybeSingle();
  
  return data?.id || null;
};
