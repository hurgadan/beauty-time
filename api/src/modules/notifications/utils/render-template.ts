import { access, constants, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { NotificationLanguage } from '@contracts';
import * as Handlebars from 'handlebars';

import { TemplateNotExistsException } from '../exceptions/template-not-exists.exception';

interface RenderTemplateInput {
  templatePath: string;
  templateData?: object;
  lang: NotificationLanguage;
}

async function templateExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export async function renderTemplate(input: RenderTemplateInput): Promise<string> {
  const { templatePath, templateData, lang } = input;

  const fullPath = join(__dirname, '..', 'templates', lang, templatePath);
  if (!(await templateExists(fullPath))) {
    throw new TemplateNotExistsException(fullPath);
  }

  const template = await readFile(fullPath, 'utf-8');
  const compiledTemplate = Handlebars.compile(template);

  return compiledTemplate(templateData ?? {});
}
