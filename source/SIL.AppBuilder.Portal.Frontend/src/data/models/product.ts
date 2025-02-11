import { AttributesObject, ResourceObject } from 'jsonapi-typescript';

export type PRODUCTS_TYPE = 'products';
export const TYPE_NAME = 'product';
export const PLURAL_NAME = 'products';

export interface ProductAttributes extends AttributesObject {
  dateCreated: string;
  dateUpdated: string;
  datePublished: string;
  dateBuilt: string;
  versionBuilt: string;
  publishLink: string;
  properties: string;
}

export type ProductResource = ResourceObject<PRODUCTS_TYPE, ProductAttributes>;
