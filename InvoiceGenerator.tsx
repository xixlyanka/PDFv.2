import React, { useState } from 'react';
import { UploadedFile, ProcessingResult, JobStatus } from '../types';
import { FileText, Plus, Trash2, Download, Loader2, ShieldCheck } from 'lucide-react';
import RewardedDownload from '../components/RewardedDownload';
import SEO from '../components/SEO';
import GoogleAd from '../components/GoogleAd';
import { AD_SLOTS } from '../constants';
import { useToast } from '../contexts/ToastContext';

interface InvoiceItem {
    id: number;
    description: string;
    quantity: number;
    rate: number;
}

const InvoiceGenerator: React.FC = () => {
  const [from, setFrom] = useState({ name: 'Your Company', address: '123 Business St', email: 'you@business.com' });
  const [to, setTo] = useState({ name: 'Client Name', address: '456 Client Rd', email: 'client@email.com' });
  const [invoiceDetails, setInvoiceDetails] = useState({ number: 'INV-001', date: new Date().toISOString().split('T')[0], dueDate: '' });
  const [items, setItems] = useState<InvoiceItem[]>([{ id: 1, description: 'Service A', quantity: 1, rate: 100 }]);
  const [taxRate, setTaxRate] = useState(0);
  
  const [status, setStatus] = useState<JobStatus>('idle');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const { addToast } = useToast();

  const addItem = () => {
      setItems([...items, { id: Date.now(), description: 'New Item', quantity: 1, rate: 0 }]);
  };

  const removeItem = (id: number) => {
      setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: number, field: keyof InvoiceItem, value: any) => {
      setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const handleGenerate = async () => {
      setStatus('processing');
      try {
          if (!window.jspdf) throw new Error("PDF Engine not loaded");
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();

          // Header
          doc.setFontSize(22);
          doc.text("INVOICE", 105, 20, { align: 'center' });
          
          doc.setFontSize(10);
          doc.text(`Invoice #: ${invoiceDetails.number}`, 150, 40);
          doc.text(`Date: ${invoiceDetails.date}`, 150, 45);
          if (invoiceDetails.dueDate) doc.text(`Due Date: ${invoiceDetails.dueDate}`, 150, 50);

          // From / To
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text("From:", 14, 40);
          doc.setFont('helvetica', 'normal');
          doc.text(from.name, 14, 45);
          doc.text(from.address, 14, 50);
          doc.text(from.email, 14, 55);

          doc.setFont('helvetica', 'bold');
          doc.text("Bill To:", 14, 70);
          doc.setFont('helvetica', 'normal');
          doc.text(to.name, 14, 75);
          doc.text(to.address, 14, 80);
          doc.text(to.email, 14, 85);

          // Items Table Header
          let y = 100;
          doc.setLineWidth(0.1);
          doc.line(14, y, 196, y);
          doc.setFont('helvetica', 'bold');
          doc.text("Description", 14, y + 5);
          doc.text("Qty", 120, y + 5);
          doc.text("Rate", 140, y + 5);
          doc.text("Amount", 170, y + 5);
          doc.line(14, y + 8, 196, y + 8);
          
          y += 15;
          doc.setFont('helvetica', 'normal');

          items.forEach(item => {
              doc.text(item.description, 14, y);
              doc.text(item.quantity.toString(), 120, y);
              doc.text(item.rate.toFixed(2), 140, y);
              doc.text((item.quantity * item.rate).toFixed(2), 170, y);
              y += 10;
          });

          y += 5;
          doc.line(14, y, 196, y);
          y += 10;

          // Totals
          doc.text(`Subtotal:`, 140, y);
          doc.text(subtotal.toFixed(2), 170, y);
          y += 7;
          doc.text(`Tax (${taxRate}%):`, 140, y);
          doc.text(tax.toFixed(2), 170, y);
          y += 10;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(14);
          doc.text(`Total:`, 140, y);
          doc.text(total.toFixed(2), 170, y);

          const blob = doc.output('blob');
          setResult({
              success: true,
              downloadUrl: URL.createObjectURL(blob),
              fileName: `invoice_${invoiceDetails.number}.pdf`,
              fileSize: 'PDF'
          });
          setStatus('completed');

      } catch (e: any) {
          addToast(e.message, 'error');
          setStatus('error');
      }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <SEO 
        title="Invoice Generator" 
        description="Create professional PDF invoices instantly in your browser."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <div className="text-center lg:text-left mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Invoice Generator</h1>
                <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">Create clean, professional invoices in seconds.</p>
            </div>

            <div className="glass-panel rounded-2xl shadow-sm p-6 md:p-8">
               {status === 'completed' && result ? (
                   <RewardedDownload downloadUrl={result.downloadUrl} fileName={result.fileName} />
               ) : (
                   <div className="space-y-8 animate-fade-in">
                        {/* Header Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Invoice Number</label>
                                <input type="text" className="input-std" value={invoiceDetails.number} onChange={e => setInvoiceDetails({...invoiceDetails, number: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Date</label>
                                <input type="date" className="input-std" value={invoiceDetails.date} onChange={e => setInvoiceDetails({...invoiceDetails, date: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Due Date</label>
                                <input type="date" className="input-std" value={invoiceDetails.dueDate} onChange={e => setInvoiceDetails({...invoiceDetails, dueDate: e.target.value})} />
                            </div>
                        </div>

                        {/* From / To */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                                <h3 className="font-bold text-indigo-600 mb-3">From (You)</h3>
                                <input type="text" placeholder="Your Name" className="input-std mb-2" value={from.name} onChange={e => setFrom({...from, name: e.target.value})} />
                                <input type="text" placeholder="Address" className="input-std mb-2" value={from.address} onChange={e => setFrom({...from, address: e.target.value})} />
                                <input type="email" placeholder="Email" className="input-std" value={from.email} onChange={e => setFrom({...from, email: e.target.value})} />
                            </div>
                            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                                <h3 className="font-bold text-indigo-600 mb-3">Bill To (Client)</h3>
                                <input type="text" placeholder="Client Name" className="input-std mb-2" value={to.name} onChange={e => setTo({...to, name: e.target.value})} />
                                <input type="text" placeholder="Address" className="input-std mb-2" value={to.address} onChange={e => setTo({...to, address: e.target.value})} />
                                <input type="email" placeholder="Email" className="input-std" value={to.email} onChange={e => setTo({...to, email: e.target.value})} />
                            </div>
                        </div>

                        {/* Items */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-gray-700 dark:text-gray-200">Items</h3>
                                <button onClick={addItem} className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center font-bold"><Plus className="w-4 h-4 mr-1" /> Add Item</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-100 dark:bg-slate-700 text-left">
                                            <th className="p-2 rounded-l-lg">Description</th>
                                            <th className="p-2 w-20">Qty</th>
                                            <th className="p-2 w-24">Rate</th>
                                            <th className="p-2 w-24">Amount</th>
                                            <th className="p-2 w-10 rounded-r-lg"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                        {items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="p-2"><input type="text" className="w-full bg-transparent outline-none" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} /></td>
                                                <td className="p-2"><input type="number" className="w-full bg-transparent outline-none" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value))} /></td>
                                                <td className="p-2"><input type="number" className="w-full bg-transparent outline-none" value={item.rate} onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value))} /></td>
                                                <td className="p-2 font-medium">{(item.quantity * item.rate).toFixed(2)}</td>
                                                <td className="p-2 text-center"><button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-full md:w-1/3 space-y-2">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span>{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center">
                                        <span>Tax %</span>
                                        <input type="number" className="ml-2 w-12 p-1 border rounded text-xs dark:bg-slate-700 dark:border-slate-600" value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} />
                                    </div>
                                    <span>{tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white border-t pt-2 dark:border-slate-700">
                                    <span>Total</span>
                                    <span>{total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleGenerate}
                            disabled={status === 'processing'}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-500/30 transition-all flex justify-center items-center"
                        >
                            {status === 'processing' ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Download className="w-5 h-5 mr-2" />}
                            Generate Invoice PDF
                        </button>
                   </div>
               )}
            </div>
        </div>

        {/* Sidebar Ad Column */}
        <div className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="glass-panel p-4 rounded-xl sticky top-24">
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 text-center">Sponsored</div>
                <GoogleAd slot={AD_SLOTS.SIDEBAR} format="rectangle" className="min-h-[600px] w-full" />
            </div>
        </div>
      </div>
      
      <style>{`
        .input-std {
            width: 100%;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            background-color: white;
            font-size: 14px;
        }
        .dark .input-std {
            background-color: #1e293b;
            border-color: #334155;
            color: white;
        }
      `}</style>
    </div>
  );
};

export default InvoiceGenerator;