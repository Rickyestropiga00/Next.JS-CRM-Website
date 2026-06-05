import { NextRequest, NextResponse } from 'next/server';

export const getId = (item: any) => item?._id ?? item?.id;

export const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
};

const authPaths = ['/login', '/register'];

export const redirectWithLocale = (
  request: NextRequest,
  locale: string,
  path: string
) => {
  const isAuthPath = authPaths.some((r) => path.startsWith(r));
  const finalPath = isAuthPath ? path : `/${locale}${path}`;
  return NextResponse.redirect(new URL(finalPath, request.url));
};
