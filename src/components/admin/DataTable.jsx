import React from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, MoreVertical, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function DataTable({ columns, data, onEdit, onDelete, onToggleActive, emptyMessage = 'Nenhum item encontrado', emptyIcon: EmptyIcon }) {
  const [deleteItem, setDeleteItem] = React.useState(null);

  const handleDelete = () => {
    if (deleteItem) {
      onDelete(deleteItem.id);
      setDeleteItem(null);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        {EmptyIcon && <EmptyIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />}
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((col) => <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col.label}</th>)}
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item, index) => (
                <motion.tr key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }} className="hover:bg-gray-50">
                  {columns.map((col) => <td key={col.key} className="px-4 py-3">{col.render ? col.render(item) : item[col.key]}</td>)}
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item)}><Pencil className="w-4 h-4 mr-2" /> Editar</DropdownMenuItem>
                        {onToggleActive && (
                          <DropdownMenuItem onClick={() => onToggleActive(item)}>
                            {item.is_active ? <><EyeOff className="w-4 h-4 mr-2" /> Desativar</> : <><Eye className="w-4 h-4 mr-2" /> Ativar</>}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setDeleteItem(item)} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y divide-gray-200">
          {data.map((item, index) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  {columns.slice(0, 2).map((col) => (
                    <div key={col.key} className={col.key === columns[0].key ? 'font-medium text-gray-900' : 'text-sm text-gray-500'}>{col.render ? col.render(item) : item[col.key]}</div>
                  ))}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(item)}><Pencil className="w-4 h-4 mr-2" /> Editar</DropdownMenuItem>
                    {onToggleActive && (
                      <DropdownMenuItem onClick={() => onToggleActive(item)}>
                        {item.is_active ? <><EyeOff className="w-4 h-4 mr-2" /> Desativar</> : <><Eye className="w-4 h-4 mr-2" /> Ativar</>}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => setDeleteItem(item)} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Excluir</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
