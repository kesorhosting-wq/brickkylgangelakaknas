import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSite } from '@/contexts/SiteContext';
import G2BulkProductSelector from './G2BulkProductSelector';
import {
  Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronUp, Package, Clock, Calendar,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface PreorderGame {
  id: string;
  game_id: string;
  is_active: boolean;
  sort_order: number;
  game_name?: string;
  game_image?: string;
  game_slug?: string;
}

interface PreorderPackage {
  id: string;
  game_id: string;
  name: string;
  amount: string;
  price: number;
  icon: string | null;
  label: string | null;
  label_bg_color: string | null;
  label_text_color: string | null;
  label_icon: string | null;
  g2bulk_product_id: string | null;
  g2bulk_type_id: string | null;
  quantity: number | null;
  scheduled_fulfill_at: string | null;
  sort_order: number;
}

const PreorderGamesTab: React.FC = () => {
  const { games } = useSite();
  const [preorderGames, setPreorderGames] = useState<PreorderGame[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGame, setExpandedGame] = useState<string | null>(null);
  const [packages, setPackages] = useState<PreorderPackage[]>([]);
  const [editingPackage, setEditingPackage] = useState<string | null>(null);
  const [editPkgData, setEditPkgData] = useState<any>({});
  const [newPkg, setNewPkg] = useState({
    name: '', amount: '', price: 0, icon: '', label: '',
    labelBgColor: '#dc2626', labelTextColor: '#ffffff', labelIcon: '',
    g2bulkProductId: '', g2bulkTypeId: '', quantity: null as number | null,
    scheduledFulfillAt: '',
  });

  useEffect(() => { loadPreorderGames(); }, []);

  const loadPreorderGames = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('preorder_games')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;

      // Enrich with game info
      const enriched = (data || []).map((pg: any) => {
        const game = games.find(g => g.id === pg.game_id);
        return {
          ...pg,
          game_name: game?.name || 'Unknown',
          game_image: game?.image || '',
          game_slug: game?.slug || '',
        };
      });
      setPreorderGames(enriched);
    } catch (error) {
      console.error('Error loading preorder games:', error);
      toast({ title: 'Failed to load pre-order games', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const addPreorderGame = async () => {
    if (!selectedGameId) {
      toast({ title: 'Please select a game', variant: 'destructive' });
      return;
    }
    // Check if already added
    if (preorderGames.some(pg => pg.game_id === selectedGameId)) {
      toast({ title: 'Game already added to pre-order', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await supabase.from('preorder_games').insert({
        game_id: selectedGameId,
        sort_order: preorderGames.length,
      });
      if (error) throw error;
      toast({ title: 'Pre-order game added!' });
      setSelectedGameId('');
      loadPreorderGames();
    } catch (error: any) {
      console.error('Error adding preorder game:', error);
      toast({ title: 'Failed to add', description: error.message, variant: 'destructive' });
    }
  };

  const removePreorderGame = async (id: string) => {
    try {
      const { error } = await supabase.from('preorder_games').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Pre-order game removed!' });
      loadPreorderGames();
    } catch (error) {
      toast({ title: 'Failed to remove', variant: 'destructive' });
    }
  };

  const loadPackages = async (gameId: string) => {
    try {
      const { data, error } = await supabase
        .from('preorder_packages')
        .select('*')
        .eq('game_id', gameId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      toast({ title: 'Failed to load packages', variant: 'destructive' });
    }
  };

  const toggleExpand = (gameId: string) => {
    if (expandedGame === gameId) {
      setExpandedGame(null);
    } else {
      setExpandedGame(gameId);
      loadPackages(gameId);
    }
  };

  const handleAddPackage = async (gameId: string) => {
    if (!newPkg.name || newPkg.price <= 0) {
      toast({ title: 'Please fill name and price', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await supabase.from('preorder_packages').insert({
        game_id: gameId,
        name: newPkg.name,
        amount: newPkg.amount,
        price: newPkg.price,
        icon: newPkg.icon || null,
        label: newPkg.label || null,
        label_bg_color: newPkg.labelBgColor || '#dc2626',
        label_text_color: newPkg.labelTextColor || '#ffffff',
        label_icon: newPkg.labelIcon || null,
        g2bulk_product_id: newPkg.g2bulkProductId || null,
        g2bulk_type_id: newPkg.g2bulkTypeId || null,
        quantity: newPkg.quantity,
        scheduled_fulfill_at: newPkg.scheduledFulfillAt || null,
        sort_order: packages.length,
      });
      if (error) throw error;
      toast({ title: 'Pre-order package added!' });
      setNewPkg({
        name: '', amount: '', price: 0, icon: '', label: '',
        labelBgColor: '#dc2626', labelTextColor: '#ffffff', labelIcon: '',
        g2bulkProductId: '', g2bulkTypeId: '', quantity: null,
        scheduledFulfillAt: '',
      });
      loadPackages(gameId);
    } catch (error: any) {
      toast({ title: 'Failed to add package', description: error.message, variant: 'destructive' });
    }
  };

  const startEditPkg = (pkg: PreorderPackage) => {
    setEditingPackage(pkg.id);
    setEditPkgData({
      name: pkg.name,
      amount: pkg.amount,
      price: pkg.price,
      icon: pkg.icon || '',
      label: pkg.label || '',
      labelBgColor: pkg.label_bg_color || '#dc2626',
      labelTextColor: pkg.label_text_color || '#ffffff',
      labelIcon: pkg.label_icon || '',
      g2bulkProductId: pkg.g2bulk_product_id || '',
      g2bulkTypeId: pkg.g2bulk_type_id || '',
      quantity: pkg.quantity,
      scheduledFulfillAt: pkg.scheduled_fulfill_at
        ? new Date(pkg.scheduled_fulfill_at).toISOString().slice(0, 19)
        : '',
    });
  };

  const saveEditPkg = async (gameId: string, pkgId: string) => {
    try {
      const { error } = await supabase.from('preorder_packages').update({
        name: editPkgData.name,
        amount: editPkgData.amount,
        price: editPkgData.price,
        icon: editPkgData.icon || null,
        label: editPkgData.label || null,
        label_bg_color: editPkgData.labelBgColor || '#dc2626',
        label_text_color: editPkgData.labelTextColor || '#ffffff',
        label_icon: editPkgData.labelIcon || null,
        g2bulk_product_id: editPkgData.g2bulkProductId || null,
        g2bulk_type_id: editPkgData.g2bulkTypeId || null,
        quantity: editPkgData.quantity,
        scheduled_fulfill_at: editPkgData.scheduledFulfillAt || null,
      }).eq('id', pkgId);
      if (error) throw error;
      toast({ title: 'Package updated!' });
      setEditingPackage(null);
      loadPackages(gameId);
    } catch (error: any) {
      toast({ title: 'Failed to update', description: error.message, variant: 'destructive' });
    }
  };

  const deletePkg = async (gameId: string, pkgId: string) => {
    try {
      const { error } = await supabase.from('preorder_packages').delete().eq('id', pkgId);
      if (error) throw error;
      toast({ title: 'Package deleted!' });
      loadPackages(gameId);
    } catch (error) {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  // Filter out games already added
  const availableGames = games.filter(g => !preorderGames.some(pg => pg.game_id === g.id));

  if (isLoading) {
    return (
      <Card className="border-gold/30">
        <CardContent className="p-8 text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto text-gold" />
          <p className="mt-4 text-muted-foreground">Loading pre-order games...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Pre-order Game */}
      <Card className="border-gold/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-gold" />
            Pre-order Games
          </CardTitle>
          <CardDescription>Select games from your game list to offer as pre-order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-6">
            <Select value={selectedGameId} onValueChange={setSelectedGameId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a game to add..." />
              </SelectTrigger>
              <SelectContent>
                {availableGames.map(game => (
                  <SelectItem key={game.id} value={game.id}>
                    {game.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addPreorderGame} className="bg-gold hover:bg-gold/90">
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>

          {/* Pre-order Game List */}
          {preorderGames.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pre-order games yet. Add one above.</p>
          ) : (
            <div className="space-y-3">
              {preorderGames.map(pg => (
                <div key={pg.id} className="border border-border rounded-lg overflow-hidden">
                  {/* Game header */}
                  <div
                    className="flex items-center gap-3 p-3 bg-card cursor-pointer hover:bg-secondary/50 transition-colors"
                    onClick={() => toggleExpand(pg.game_id)}
                  >
                    {pg.game_image && (
                      <img src={pg.game_image} alt={pg.game_name} className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <div className="flex-1">
                      <p className="font-bold">{pg.game_name}</p>
                      <p className="text-xs text-muted-foreground">Pre-order</p>
                    </div>
                    <Badge className="bg-gold text-primary-foreground">Pre-order</Badge>
                    <Button
                      variant="ghost" size="sm"
                      onClick={(e) => { e.stopPropagation(); removePreorderGame(pg.id); }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {expandedGame === pg.game_id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>

                  {/* Expanded packages section */}
                  {expandedGame === pg.game_id && (
                    <div className="p-4 bg-secondary/20 border-t border-border space-y-4">
                      <h4 className="font-bold flex items-center gap-2">
                        <Package className="w-4 h-4 text-gold" />
                        Pre-order Packages
                      </h4>

                      {/* Existing packages */}
                      {packages.map(pkg => (
                        <div key={pkg.id} className="p-3 rounded-lg border border-border bg-card">
                          {editingPackage === pkg.id ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="Name" value={editPkgData.name}
                                  onChange={e => setEditPkgData((p: any) => ({ ...p, name: e.target.value }))} />
                                <Input placeholder="Amount" value={editPkgData.amount}
                                  onChange={e => setEditPkgData((p: any) => ({ ...p, amount: e.target.value }))} />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <Input type="number" placeholder="Price" value={editPkgData.price}
                                  onChange={e => setEditPkgData((p: any) => ({ ...p, price: Number(e.target.value) }))} />
                                <Input type="number" placeholder="Qty (empty=1x)" value={editPkgData.quantity ?? ''}
                                  onChange={e => setEditPkgData((p: any) => ({ ...p, quantity: e.target.value ? Number(e.target.value) : null }))} />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="Icon URL" value={editPkgData.icon}
                                  onChange={e => setEditPkgData((p: any) => ({ ...p, icon: e.target.value }))} />
                                <Input placeholder="Label" value={editPkgData.label}
                                  onChange={e => setEditPkgData((p: any) => ({ ...p, label: e.target.value }))} />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="G2Bulk Product ID" value={editPkgData.g2bulkProductId}
                                  onChange={e => setEditPkgData((p: any) => ({ ...p, g2bulkProductId: e.target.value }))} />
                                <Input placeholder="G2Bulk Type ID" value={editPkgData.g2bulkTypeId}
                                  onChange={e => setEditPkgData((p: any) => ({ ...p, g2bulkTypeId: e.target.value }))} />
                              </div>
                              {/* Scheduled fulfillment time */}
                              <div className="p-3 rounded-lg border border-gold/30 bg-gold/5">
                                <label className="flex items-center gap-2 text-sm font-bold mb-2">
                                  <Calendar className="w-4 h-4 text-gold" />
                                  Scheduled Fulfillment Time
                                </label>
                                <Input
                                  type="datetime-local"
                                  step="1"
                                  value={editPkgData.scheduledFulfillAt}
                                  onChange={e => setEditPkgData((p: any) => ({ ...p, scheduledFulfillAt: e.target.value }))}
                                  className="border-gold/50"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Orders will NOT auto-process until this date/time
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => saveEditPkg(pg.game_id, pkg.id)} className="bg-gold hover:bg-gold/90">
                                  <Save className="w-3 h-3 mr-1" /> Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingPackage(null)}>
                                  <X className="w-3 h-3 mr-1" /> Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-bold">{pkg.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {pkg.amount} • ${pkg.price} • Qty: {pkg.quantity ?? 1}x
                                  {pkg.g2bulk_product_id && ` • G2: ${pkg.g2bulk_product_id}`}
                                </p>
                                {pkg.scheduled_fulfill_at && (
                                  <p className="text-xs text-gold flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" />
                                    Fulfill at: {new Date(pkg.scheduled_fulfill_at).toLocaleString()}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => startEditPkg(pkg)}>
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deletePkg(pg.game_id, pkg.id)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add new package */}
                      <div className="p-3 rounded-lg border border-dashed border-gold/30 space-y-3">
                        <h5 className="text-sm font-bold">Add Pre-order Package</h5>
                        <div className="grid grid-cols-2 gap-2">
                          <Input placeholder="Package Name" value={newPkg.name}
                            onChange={e => setNewPkg(p => ({ ...p, name: e.target.value }))} />
                          <Input placeholder="Amount (e.g. 100 Diamonds)" value={newPkg.amount}
                            onChange={e => setNewPkg(p => ({ ...p, amount: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="number" placeholder="Price ($)" value={newPkg.price || ''}
                            onChange={e => setNewPkg(p => ({ ...p, price: Number(e.target.value) }))} />
                          <Input type="number" placeholder="Qty (empty=1x)" value={newPkg.quantity ?? ''}
                            onChange={e => setNewPkg(p => ({ ...p, quantity: e.target.value ? Number(e.target.value) : null }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input placeholder="G2Bulk Product ID" value={newPkg.g2bulkProductId}
                            onChange={e => setNewPkg(p => ({ ...p, g2bulkProductId: e.target.value }))} />
                          <Input placeholder="G2Bulk Type ID" value={newPkg.g2bulkTypeId}
                            onChange={e => setNewPkg(p => ({ ...p, g2bulkTypeId: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input placeholder="Icon URL" value={newPkg.icon}
                            onChange={e => setNewPkg(p => ({ ...p, icon: e.target.value }))} />
                          <Input placeholder="Label" value={newPkg.label}
                            onChange={e => setNewPkg(p => ({ ...p, label: e.target.value }))} />
                        </div>
                        {/* Scheduled fulfillment time */}
                        <div className="p-3 rounded-lg border border-gold/30 bg-gold/5">
                          <label className="flex items-center gap-2 text-sm font-bold mb-2">
                            <Calendar className="w-4 h-4 text-gold" />
                            Scheduled Fulfillment Time
                          </label>
                          <Input
                            type="datetime-local"
                            step="1"
                            value={newPkg.scheduledFulfillAt}
                            onChange={e => setNewPkg(p => ({ ...p, scheduledFulfillAt: e.target.value }))}
                            className="border-gold/50"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Set when orders should be processed (year/month/day/hour/minute/second)
                          </p>
                        </div>
                        <Button size="sm" onClick={() => handleAddPackage(pg.game_id)} className="bg-gold hover:bg-gold/90">
                          <Plus className="w-3 h-3 mr-1" /> Add Package
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PreorderGamesTab;
