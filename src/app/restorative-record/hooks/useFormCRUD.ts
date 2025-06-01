import { useState } from "react";
import { generateId } from "../utils";

interface UseFormCRUDOptions<T> {
  initialFormState: T;
  validateForm?: (form: T) => boolean;
}

export function useFormCRUD<T>(
  options: UseFormCRUDOptions<T>
) {
  const { initialFormState, validateForm } = options;
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

  const handleDelete = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
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
