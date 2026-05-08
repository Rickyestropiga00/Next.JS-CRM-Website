export const getId = (item: any) => item?._id ?? item?.id;

export const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
};
