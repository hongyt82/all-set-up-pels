// src/utils/ruleHtmlDecode.ts

export const decodeHtmlEntities = (value: string): string => {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&#40;', '(')
    .replaceAll('&#41;', ')')
    .replaceAll('&#39;', "'")
    .replaceAll('&quot;', '"');
};

const decodeText = (value: unknown): unknown => {
  return typeof value === 'string' ? decodeHtmlEntities(value) : value;
};

export const decodeRuleComponent = (component: any): any => {
  if (!component) return component;

  return {
    ...component,

    calculations: Array.isArray(component.calculations)
      ? component.calculations.map((calculation: any) => ({
          ...calculation,
          expression: decodeText(calculation.expression),
          when: decodeText(calculation.when),
          emptyWhen: decodeText(calculation.emptyWhen),
        }))
      : component.calculations,

    constraints: Array.isArray(component.constraints)
      ? component.constraints.map((constraint: any) => ({
          ...constraint,
          expression: decodeText(constraint.expression),
        }))
      : component.constraints,

    events: Array.isArray(component.events)
      ? component.events.map((event: any) => ({
          ...event,
          condition: decodeText(event.condition),
          when: decodeText(event.when),
        }))
      : component.events,
  };
};

export const decodeRulePage = (page: any): any => {
  if (!page) return page;

  return {
    ...page,
    components: Array.isArray(page.components)
      ? page.components.map((component: any) => decodeRuleComponent(component))
      : page.components,
  };
};

export const decodeRuleExpressions = (doc: any): any => {
  if (!doc?.pages) return doc;

  return {
    ...doc,
    pages: doc.pages.map((page: any) => decodeRulePage(page)),
  };
};
