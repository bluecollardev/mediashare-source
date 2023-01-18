export const maxLength = (max: any) => (value: any) => value?.length > max;

export const minLength = (min: any) => (value: any) => value?.length < min;

export const titleValidator = (title) => !title ? true : minLength(3)(title);

export const descriptionValidator = (desc) => !desc ? true : minLength(3)(desc);

export const visibilityValidator = (visibility) => !visibility ? true : minLength(1)(visibility);

export const tagValidator = (tag) => !tag ? true : minLength(1)(tag);
