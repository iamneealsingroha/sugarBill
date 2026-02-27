
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '../components/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';
import ClayInput from '../components/ClayInput';
import FoodItemCard from '../components/FoodItemCard';
import AddFoodForm from '../components/AddFoodForm';
import PrintableBill from '../components/PrintableBill';
import { Printer, TrendingUp, DollarSign, Loader2, Search } from 'lucide-react';

function DashboardContent() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: allItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['foodItems', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const items = await base44.entities.FoodItem.list('-created_date');
      return items.filter((item) => item.created_by === user.email);
    },
    enabled: !!user?.email
  });

  const items = allItems.filter((item) => item.created_by === user?.email);

  const filteredItems = items.filter((item) =>
  item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FoodItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodItems', user?.email] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FoodItem.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['foodItems', user?.email] });
      const previousItems = queryClient.getQueryData(['foodItems', user?.email]);
      queryClient.setQueryData(['foodItems', user?.email], (old) => {
        return old.map((item) => item.id === id ? { ...item, ...data } : item);
      });
      return { previousItems };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['foodItems', user?.email], context.previousItems);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['foodItems', user?.email] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      const item = items.find((i) => i.id === id);
      if (!item || item.created_by !== user?.email) {
        throw new Error('Unauthorized');
      }
      return base44.entities.FoodItem.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodItems', user?.email] });
    }
  });

  const handleQuantityChange = (id, newQuantity) => {
    const item = items.find((i) => i.id === id);
    if (!item || item.created_by !== user?.email) return;
    const finalQuantity = Math.max(0, newQuantity);
    updateMutation.mutate({ id, data: { quantity: finalQuantity } });
  };

  const handleEdit = async (item) => {
    if (item.created_by !== user?.email) return;
    const name = prompt(t('editName'), item.name);
    if (!name) return;
    const sugar = parseFloat(prompt(t('editSugar'), item.sugar));
    if (isNaN(sugar)) return;
    const cost = parseFloat(prompt(t('editCost'), item.cost));
    if (isNaN(cost)) return;
    updateMutation.mutate({ id: item.id, data: { name, sugar, cost } });
  };

  const handleDelete = async (id) => {
    const item = items.find((i) => i.id === id);
    if (!item || item.created_by !== user?.email) return;
    if (confirm(t('deleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalSugar = items.reduce((sum, item) => sum + item.sugar * item.quantity, 0).toFixed(1);
  const totalCost = items.reduce((sum, item) => sum + item.cost * item.quantity, 0).toFixed(2);
  const isLoading = userLoading || itemsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <ClayCard color="white">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto" />
          <p className="text-center mt-4 text-gray-600">{t('loading')}</p>
        </ClayCard>
      </div>);

  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <ClayCard color="white">
          <p className="text-center text-gray-600">{t('loginRequired')}</p>
        </ClayCard>
      </div>);

  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4 md:p-8 print:hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-4 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                {t('appTitle')}
              </h1>
              <LanguageSelector />
            </div>
            <p className="text-gray-600 text-xs opacity-100 rounded-lg">{t('tagline')}</p>
            {user &&
            <p className="text-sm text-purple-600 mt-2">
                {t('welcome')}, {user.full_name || user.email}!
              </p>
            }
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <ClayCard color="mint">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{t('totalSugar')}</p>
                  <p className="text-3xl font-bold text-orange-700">{totalSugar}g</p>
                </div>
                <TrendingUp className="w-12 h-12 text-orange-500 opacity-50" />
              </div>
            </ClayCard>

            <ClayCard color="blue">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{t('totalCost')}</p>
                  <p className="text-3xl font-bold text-green-700">₹{totalCost}</p>
                </div>
                <DollarSign className="w-12 h-12 text-green-500 opacity-50" />
              </div>
            </ClayCard>

            <ClayCard color="yellow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{t('totalItems')}</p>
                  <p className="text-3xl font-bold text-purple-700">{items.length}</p>
                </div>
                <div className="text-4xl">📦</div>
              </div>
            </ClayCard>
          </div>

          <AddFoodForm onAdd={(data) => createMutation.mutate(data)} />

          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{t('yourFoodItems')}</h2>
              <div className="flex gap-3 w-full md:w-auto">
                <div className="flex-1 md:w-64">
                  <ClayInput
                    type="text"
                    placeholder={`🔍 ${t('searchPlaceholder')}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search className="w-5 h-5" />} />

                </div>
                <ClayButton variant="info" onClick={handlePrint} disabled={items.length === 0}>
                  <Printer className="w-5 h-5 inline md:mr-2" />
                  <span className="hidden md:inline">{t('printBill')}</span>
                </ClayButton>
              </div>
            </div>
            
            {filteredItems.length === 0 ?
            <ClayCard color="white">
                <p className="text-center text-gray-500 py-8">
                  {searchQuery ? `${t('noSearch')} "${searchQuery}" 🔍` : t('noItems')}
                </p>
              </ClayCard> :

            <div className="space-y-4">
                {filteredItems.map((item) =>
              <FoodItemCard
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onEdit={handleEdit}
                onDelete={handleDelete} />

              )}
              </div>
            }
          </div>

          <ClayCard color="lavender">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">📊 {t('summary')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/50 rounded-[16px] p-4 shadow-inner">
                <p className="text-gray-600 mb-2">{t('totalSugarIntake')}</p>
                <p className="text-4xl font-bold text-orange-700">{totalSugar}g</p>
                <p className="text-sm text-gray-500 mt-2">
                  {parseFloat(totalSugar) > 50 ? `⚠️ ${t('aboveLimit')}` : `✅ ${t('withinRange')}`}
                </p>
              </div>
              
              <div className="bg-white/50 rounded-[16px] p-4 shadow-inner">
                <p className="text-gray-600 mb-2">{t('totalMoneySpent')}</p>
                <p className="text-4xl font-bold text-green-700">₹{totalCost}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {t('average')}: ₹{items.length > 0 ? (parseFloat(totalCost) / items.length).toFixed(2) : '0'} {t('perItem')}
                </p>
              </div>
            </div>
          </ClayCard>

          <div className="text-center mt-8 py-6">
            <p className="text-gray-500 text-sm">{t('copyright')}</p>
          </div>
        </div>
      </div>

      <PrintableBill
        items={items}
        totalSugar={totalSugar}
        totalCost={totalCost}
        userName={user?.full_name || user?.email} />

    </>);

}

export default function Dashboard() {
  return (
    <LanguageProvider>
      <DashboardContent />
    </LanguageProvider>);

}