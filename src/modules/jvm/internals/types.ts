import type { ComponentType } from 'react';
import type { ComponentId } from '@/content/jvm/ids';
import type { Rect } from '@/lib/geometry';
import type { Citation, RichText } from '@/types/content';

export interface DissectionPart {
  id: string;
  label: string;
  description: RichText;
  /** Selecting the part also opens this component in the inspector. */
  componentId?: ComponentId;
}

export interface DissectionProps {
  activePart: string | null;
  onPart: (partId: string) => void;
}

export interface Dissection {
  /** Component this plate dissects. */
  id: ComponentId;
  title: string;
  subtitle: string;
  bounds: Rect;
  accuracyNote: RichText;
  parts: DissectionPart[];
  references: Citation[];
  Plate: ComponentType<DissectionProps>;
}
