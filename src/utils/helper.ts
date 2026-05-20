import { NextRequest, NextResponse } from 'next/server';

export const getId = (item: any) => item?._id ?? item?.id;

export const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
};

export const redirectWithLocale = (
  request: NextRequest,
  locale: string,
  path: string
) => {
  return NextResponse.redirect(new URL(`/${locale}${path}`, request.url));
};
