import { useState } from "react";
import { generateId } from "../utils";
import { deleteFromSupabase } from "../utils/saveToSupabase";

interface UseFormCRUDOptions<T> {
  initialFormState: T;
  validateForm?: (form: T) => boolean;
  tableName?: string;
  userId?: string;
  toast?: (options: { title: string; description: string; variant?: string }) => void;
  onDelete?: () => void | Promise<void>;
}

export function useFormCRUD<T>(
  options: UseFormCRUDOptions<T>
) {
  const { initialFormState, validateForm, tableName, userId, toast, onDelete } = options;
  const [items, setItems] = useState<(T & { id: string })[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<T>(initialFormState);

  const resetForm = () => {
    setForm(initialFormState);
    setEditingId(null);
  };

  const handleFormOpen = () => {
    setShowForm(true);
    resetForm();
  };

  const handleFormClose = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSave = () => {
    if (validateForm && !validateForm(form)) {
      return false;
    }

    if (editingId) {
      setItems(
        items.map((item) =>
          item.id === editingId ? { ...item, ...form, id: item.id } : item
        )
      );
    } else {
      const newItem = { ...form, id: generateId() } as T & { id: string };
      setItems([...items, newItem]);
    }

    handleFormClose();
    return true;
  };

  const handleEdit = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      const { id: _, ...itemWithoutId } = item;
      setForm(itemWithoutId as T);
      setEditingId(id);
      setShowForm(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (tableName && userId && toast) {
      try {
        const success = await deleteFromSupabase(tableName, id, userId, toast);
        if (success) {
          setItems((prevItems) => {
            const newItems = prevItems.filter((i) => i.id !== id);
            console.log(`Deleted item ${id}, remaining items:`, newItems.length);
            return newItems;
          });
          toast({
            title: "Success",
            description: "Item deleted successfully",
          });
          if (onDelete) {
            await onDelete();
          }
          return true;
        }
      } catch (error) {
        console.error("Error deleting item:", error);
        toast({
          title: "Error",
          description: "Failed to delete item",
          variant: "destructive",
        });
      }
      return false;
    } else {
      setItems((prevItems) => {
        const newItems = prevItems.filter((i) => i.id !== id);
        console.log(`Deleted item ${id} locally, remaining items:`, newItems.length);
        return newItems;
      });
      if (onDelete) {
        await onDelete();
      }
      return true;
    }
  };

  const updateForm = (updates: Partial<T>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  return {
    items,
    setItems,
    showForm,
    editingId,
    form,
    handleFormOpen,
    handleFormClose,
    handleSave,
    handleEdit,
    handleDelete,
    updateForm,
  };
} 
