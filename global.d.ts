declare class Calendar {
  constructor(
    element: HTMLElement,
    options: {
      events: { start: string; end: string; title: string; resourceId?: string }[];
      resources: { id: string; title: string }[];
      view: string;
      editable: boolean;
      resourceAreaWidth?: string;
      resourceLabelText?: string;
      dateClick?: (info: { dateStr: string }) => void;
    }
  );
}
