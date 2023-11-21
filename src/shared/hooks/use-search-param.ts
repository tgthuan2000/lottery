import { isEmpty } from 'lodash';
import { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SEARCH_PARAMS } from '../constants/search-param';

const useSearchParam = <T = string>(
  variant: UseSearchParam<T>['Variant'],
  options?: UseSearchParam<T>['Option']
): [UseSearchParam<T>['Value'], UseSearchParam<T>['Dispatch'], UseSearchParam<T>['Value']] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = (searchParams.get(variant) as T) ?? options?.defaultValue;

  const { current: valueRef } = useRef(value);

  const setValue: UseSearchParam<T>['Dispatch'] = (value) => {
    setSearchParams(
      (searchParam) => {
        const urlSearchParams = new URLSearchParams(searchParam);

        const _value = value instanceof Function ? value(urlSearchParams) : value;

        if (isEmpty(_value) || !_value) {
          urlSearchParams.delete(variant);
        } else {
          urlSearchParams.set(variant, _value.toString());
        }

        return urlSearchParams;
      },
      {
        replace: options?.replace ?? true,
      }
    );
  };

  return [valueRef, setValue, value];
};

export interface UseSearchParam<T = string> {
  ReturnType: ReturnType<typeof useSearchParam<T>>;
  Dispatch: {
    (value: T | null | undefined): void;
    (callback: (searchParam: URLSearchParams) => T | null | undefined): void;
  };
  Variant: SEARCH_PARAMS;
  Value: T | undefined;
  Option: { defaultValue?: T; replace?: boolean };
}

export default useSearchParam;
