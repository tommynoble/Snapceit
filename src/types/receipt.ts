export interface ReceiptItem {
  description: string;
  price: number;
}

export interface Receipt {
  receiptId: string;
  userId: string;
  merchantName: string;
  total: number;
  date: string;
  category: string;
  imageUrl: string;
  status: 'processed' | 'pending' | 'error';
  items: ReceiptItem[];
  createdAt: string;
  updatedAt: string;
}
