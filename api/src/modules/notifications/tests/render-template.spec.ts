import { NotificationLanguage } from '@contracts';

import { TemplateNotExistsException } from '../exceptions/template-not-exists.exception';
import { renderTemplate } from '../utils/render-template';

describe('renderTemplate', () => {
  it('renders existing template for en locale', async () => {
    const result = await renderTemplate({
      lang: NotificationLanguage.EN,
      templatePath: 'booking-created.body.hbs',
      templateData: {
        appointmentId: 'appt-1',
        startsAtIso: '2026-03-10T09:00:00.000Z',
      },
    });

    expect(result).toContain('appt-1');
    expect(result).toContain('2026-03-10T09:00:00.000Z');
  });

  it('throws TemplateNotExistsException for missing template', async () => {
    await expect(
      renderTemplate({
        lang: NotificationLanguage.DE,
        templatePath: 'missing-template.hbs',
      }),
    ).rejects.toBeInstanceOf(TemplateNotExistsException);
  });
});
