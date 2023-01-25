export const maxLength = (max: any) => (value: any) => value?.length > max;

export const minLength = (min: any) => (value: any) => value?.length < min;

export const titleValidator = (title) => !title ? true : minLength(2)(title);

export const descriptionValidator = (desc) => !desc ? true : minLength(5)(desc);

// TODO: Fix this! Check an enum or something...
export const visibilityValidator = (visibility) => !visibility ? true : minLength(1)(visibility);

export const tagValidator = (tag) => !tag ? true : minLength(1)(tag);
