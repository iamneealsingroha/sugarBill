import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from './LanguageContext';
import ClayCard from './ClayCard';
import ClayInput from './ClayInput';
import ClayButton from './ClayButton';
import BarcodeScanner from './BarcodeScanner';
import { Plus, Loader2, Scan, ShieldAlert } from 'lucide-react';

export default function AddFoodForm({ onAdd }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    sugar: '',
    cost: '',
    category: 'other'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [needsSugarInput, setNeedsSugarInput] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const checkChildFriendly = async (foodName) => {
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Is "${foodName}" appropriate and safe for children to consume? 
        
        Consider:
        1. Is it a regular food/drink item suitable for kids?
        2. Does it contain alcohol, tobacco, drugs, or any harmful substances?
        3. Is it age-appropriate for children?
        
        Respond with ONLY "YES" if it's child-friendly, or "NO" if it's not appropriate for children.
        Do not include any explanation, just YES or NO.`,
        add_context_from_internet: false,
      });

      const answer = result.trim().toUpperCase();
      return answer === 'YES';
    } catch (error) {
      console.error('Error checking child-friendliness:', error);
      return true;
    }
  };

  const searchSugarContent = async (foodName) => {
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `What is the sugar content in grams per 100g or per standard serving of "${foodName}"? 
        Please provide ONLY the numerical value in grams. If you cannot find exact information, respond with "UNKNOWN".
        Examples of good responses: "19", "14.5", "0.4"
        Do not include units or explanations, just the number.`,
        add_context_from_internet: true,
      });

      const sugarValue = result.trim();
      
      if (sugarValue === 'UNKNOWN' || isNaN(parseFloat(sugarValue))) {
        return null;
      } else {
        return parseFloat(sugarValue);
      }
    } catch (error) {
      console.error('Error searching sugar content:', error);
      return null;
    }
  };

  const handleScanComplete = async (scanData) => {
    setShowScanner(false);
    setLoading(true);
    setMessage(`✅ ${t('scanComplete')}`);

    setFormData({
      name: scanData.name || '',
      sugar: scanData.sugar ? scanData.sugar.toString() : '',
      cost: scanData.cost ? scanData.cost.toString() : '',
      category: 'other'
    });

    if (scanData.name && scanData.cost && scanData.sugar) {
      setMessage(`🔍 ${t('checkingItem')}`);
      const isChildFriendly = await checkChildFriendly(scanData.name);
      
      if (!isChildFriendly) {
        setMessage(`🚫 ${t('notChildFriendly')}`);
        setFormData({ name: '', sugar: '', cost: '', category: 'other' });
        setLoading(false);
        return;
      }

      setMessage(`✅ ${t('allInfoFound')}`);
      await onAdd({
        name: scanData.name,
        sugar: scanData.sugar,
        cost: scanData.cost,
        quantity: 1,
        category: 'other'
      });
      
      setFormData({ name: '', sugar: '', cost: '', category: 'other' });
      setMessage('');
      setNeedsSugarInput(false);
    } else if (scanData.name && scanData.cost && !scanData.sugar) {
      setMessage(`🔍 ${t('checkingItem')}`);
      const isChildFriendly = await checkChildFriendly(scanData.name);
      
      if (!isChildFriendly) {
        setMessage(`🚫 ${t('notChildFriendly')}`);
        setFormData({ name: '', sugar: '', cost: '', category: 'other' });
        setLoading(false);
        return;
      }

      setMessage(`🔍 ${t('searchingSugar')}`);
      const sugarContent = await searchSugarContent(scanData.name);
      
      if (sugarContent !== null) {
        setMessage(`✅ ${t('foundSugar')} ${sugarContent}g! ${t('addingItem')}`);
        await onAdd({
          name: scanData.name,
          sugar: sugarContent,
          cost: scanData.cost,
          quantity: 1,
          category: 'other'
        });
        setFormData({ name: '', sugar: '', cost: '', category: 'other' });
        setMessage('');
      } else {
        setMessage(`❌ ${t('couldNotFind')}`);
        setNeedsSugarInput(true);
      }
    } else {
      setMessage(`⚠️ ${t('completeFields')}`);
      if (!scanData.sugar) {
        setNeedsSugarInput(true);
      }
    }
    
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setMessage(`❌ ${t('enterFoodName')}`);
      return;
    }

    if (!formData.cost) {
      setMessage(`❌ ${t('enterCost')}`);
      return;
    }

    setLoading(true);
    setMessage(`🔍 ${t('checkingItem')}`);

    const isChildFriendly = await checkChildFriendly(formData.name);
    
    if (!isChildFriendly) {
      setMessage(`🚫 ${t('notChildFriendly')}`);
      setFormData({ name: '', sugar: '', cost: '', category: 'other' });
      setNeedsSugarInput(false);
      setLoading(false);
      return;
    }

    if (formData.sugar) {
      setMessage('');
      
      await onAdd({
        name: formData.name,
        sugar: parseFloat(formData.sugar),
        cost: parseFloat(formData.cost),
        quantity: 1,
        category: formData.category
      });
      
      setFormData({ name: '', sugar: '', cost: '', category: 'other' });
      setNeedsSugarInput(false);
      setLoading(false);
      return;
    }

    setMessage(`🔍 ${t('searchingSugar')}`);

    const sugarContent = await searchSugarContent(formData.name);

    if (sugarContent !== null) {
      setMessage(`✅ ${t('foundSugar')} ${sugarContent}g! ${t('addingItem')}`);
      
      await onAdd({
        name: formData.name,
        sugar: sugarContent,
        cost: parseFloat(formData.cost),
        quantity: 1,
        category: formData.category
      });
      
      setFormData({ name: '', sugar: '', cost: '', category: 'other' });
      setMessage('');
      setNeedsSugarInput(false);
    } else {
      setMessage(`❌ ${t('couldNotFind')}`);
      setNeedsSugarInput(true);
    }

    setLoading(false);
  };

  const handleNameChange = (e) => {
    setFormData({ ...formData, name: e.target.value });
    setMessage('');
    setNeedsSugarInput(false);
  };

  const handleCostChange = (e) => {
    setFormData({ ...formData, cost: e.target.value });
    setMessage('');
  };

  return (
    <>
      <ClayCard color="white" className="mb-6 border-4 border-dashed border-purple-300">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              ✨ {t('addNewFood')}
            </h2>
            <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              Child-friendly items only! 👶🍎
            </p>
          </div>
          <ClayButton 
            variant="info" 
            onClick={() => setShowScanner(true)}
            disabled={loading}
          >
            <Scan className="w-5 h-5 inline mr-2" />
            {t('scanBarcode')}
          </ClayButton>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ClayInput
              type="text"
              placeholder={t('foodName')}
              value={formData.name}
              onChange={handleNameChange}
              disabled={loading}
            />
            
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={loading}
              className="w-full px-4 py-3 bg-white/80 rounded-[16px] border-none shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,1)] focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-900 disabled:opacity-50"
            >
              <option value="fruits">🍎 {t('fruits')}</option>
              <option value="snacks">🍿 {t('snacks')}</option>
              <option value="meals">🍽️ {t('meals')}</option>
              <option value="drinks">🥤 {t('drinks')}</option>
              <option value="sweets">🍰 {t('sweets')}</option>
              <option value="other">📦 {t('other')}</option>
            </select>
          </div>

          {message && (
            <div className={`
              px-4 py-3 rounded-[14px] text-sm font-medium
              ${message.includes('✅') ? 'bg-green-100 text-green-800 border-2 border-green-300' : 
                message.includes('❌') || message.includes('🚫') ? 'bg-red-100 text-red-800 border-2 border-red-300' : 
                message.includes('⚠️') ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300' :
                'bg-blue-100 text-blue-800 border-2 border-blue-300'}
            `}>
              {message}
            </div>
          )}

          {needsSugarInput && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-[16px] p-4">
              <p className="text-sm text-yellow-800 mb-3 font-semibold">
                ⚠️ {t('enterManually')}
              </p>
              <ClayInput
                type="number"
                placeholder={t('sugar')}
                value={formData.sugar}
                onChange={(e) => setFormData({ ...formData, sugar: e.target.value })}
                min="0"
                step="0.1"
                disabled={loading}
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!needsSugarInput && (
              <ClayInput
                type="number"
                placeholder={t('sugarOptional')}
                value={formData.sugar}
                onChange={(e) => setFormData({ ...formData, sugar: e.target.value })}
                min="0"
                step="0.1"
                disabled={loading}
              />
            )}
            
            <ClayInput
              type="number"
              placeholder={t('cost')}
              value={formData.cost}
              onChange={handleCostChange}
              min="0"
              step="0.01"
              disabled={loading}
              className={needsSugarInput ? 'md:col-span-2' : ''}
            />
          </div>
          
          <ClayButton 
            type="submit" 
            variant="success" 
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                {t('processing')}
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 inline mr-2" />
                {t('addItem')}
              </>
            )}
          </ClayButton>
        </form>
      </ClayCard>

      {showScanner && (
        <BarcodeScanner
          onScanComplete={handleScanComplete}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}