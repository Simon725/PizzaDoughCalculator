import { DoughMethod, YeastType } from '../dough/dough.model';

export const YEAST_TYPE_LABELS: Record<YeastType, string> = {
  fresh: 'Frischhefe',
  instant: 'Trockenhefe',
};

export const METHOD_LABELS: Record<DoughMethod, string> = {
  direct: 'Direkt',
  poolish: 'Poolish',
  biga: 'Biga',
};
