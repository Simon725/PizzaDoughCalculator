import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type IconName =
  | 'system'
  | 'moon'
  | 'sun'
  | 'arrow-up'
  | 'arrow-down'
  | 'close'
  | 'minus'
  | 'plus'
  | 'snowflake'
  | 'alert';

const ICON_PATHS: Record<IconName, readonly string[]> = {
  system: ['M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18Z'],
  moon: ['M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z'],
  sun: [
    'M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8Z',
    'M12 2v2',
    'M12 20v2',
    'm4.9 4.9 1.4 1.4',
    'm17.7 17.7 1.4 1.4',
    'M2 12h2',
    'M20 12h2',
    'm6.3 17.7-1.4 1.4',
    'm19.1 4.9-1.4 1.4',
  ],
  'arrow-up': ['M12 19V5', 'm5 12 7-7 7 7'],
  'arrow-down': ['M12 5v14', 'm19 12-7 7-7-7'],
  close: ['M18 6 6 18', 'm6 6 12 12'],
  minus: ['M5 12h14'],
  plus: ['M12 5v14', 'M5 12h14'],
  snowflake: ['M12 2v20', 'm4.9 7 14.2 10', 'm4.9 17 14.2-10', 'm9 4 3 3 3-3', 'm9 20 3-3 3 3'],
  alert: ['M12 8v5', 'M12 16.5v.01'],
};

const FILLED_PATHS: Partial<Record<IconName, readonly string[]>> = {
  system: ['M12 3v18a9 9 0 0 0 0-18Z'],
};

@Component({
  selector: 'app-icon',
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      @for (path of paths(); track $index) {
        <path [attr.d]="path" />
      }
      @for (path of filledPaths(); track $index) {
        <path [attr.d]="path" fill="currentColor" stroke="none" />
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      width: 1em;
      height: 1em;
    }

    svg {
      width: 100%;
      height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly name = input.required<IconName>();

  protected readonly paths = computed(() => ICON_PATHS[this.name()]);
  protected readonly filledPaths = computed(() => FILLED_PATHS[this.name()] ?? []);
}
