export type IAnnouncement = {
  id: number;
  created_at: string;
  text: string | null;
  validFrom: string | null;
  validUntil: string | null;
  text_en: string | null;
};

export type IAnnouncementCreate = Omit<IAnnouncement, 'id' | 'created_at'>;
