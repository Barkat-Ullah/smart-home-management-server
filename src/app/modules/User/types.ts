// ── Types ──
interface ISingleMailPayload {
  toEmail: string;
  subject: string;
  body: string;
  adminName?: string;
  priority?: 'normal' | 'important' | 'urgent';
}

interface IBulkMailPayload {
  userIds?: string[];
  subject: string;
  body: string;
  adminName?: string;
  priority?: 'normal' | 'important' | 'urgent';
}
