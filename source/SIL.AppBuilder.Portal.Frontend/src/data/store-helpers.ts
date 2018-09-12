import Store from '@orbit/store';
import { QueryBuilder, QueryOrExpression } from '@orbit/data';
import { camelize } from '@orbit/utils';

import { ResourceObject, AttributesObject } from 'jsonapi-typescript';

import { schema, keyMap } from './schema';
import { defaultOptions, defaultSourceOptions } from './store';

export interface IBuildNewOptions<TAttrs, TRelationships> {
  attributes?: TAttrs;
  relationships?: TRelationships;
}

export interface IQueryOptions {
  include?: string[];
  settings?: any;
}

export function buildFindRelatedRecords(q: QueryBuilder, record: any, relationship: string) {
  return q.findRelatedRecords({ type: record.type, id: record.id }, relationship);
}

export function buildFindRelatedRecord(q: QueryBuilder, record: any, relationship: string) {
  return q.findRelatedRecord(record, relationship);
}

export function buildFindRecord(q: QueryBuilder, type: string, id: string) {
  const recordIdentity = recordIdentityFrom(id, type);

  return q.findRecord(recordIdentity);
}

export function modelNameFromRelationship(record: any, relationshipName: string) {
  const recordModelName = record.type;

  const { models } = schema;
  const modelSchemaInfo = models[recordModelName];

  const relationship = modelSchemaInfo.relationships[relationshipName];

  const modelName = camelize(relationship.model);

  return modelName;
}

export function inverseRelationshipOf(modelName: string, relationshipName) {
  const { models } = schema;
  const modelSchemaInfo = models[modelName];

  const relationship = modelSchemaInfo.relationships[relationshipName];

  return relationship.inverse;
}

export function buildOptions(options: IQueryOptions = {}, label?: string) {
  const maybeInclude: any = {};

  if (options.include) {
    maybeInclude.include = options.include;
  }

  return {
    label: label || 'Remote Query',
    sources: {
      remote: {
        settings: {
          ...defaultSourceOptions(),
          ...(options.settings || {})
        },
        ...maybeInclude
      }
    }
  };
}

// NOTE: id here must be a remote id (in the resource)
export async function update<TAttrs, TRelationships>(
  store: Store,
  resource: any,
  options: IBuildNewOptions<TAttrs, TRelationships>
) {
  await store.update(
    q => q.replaceRecord({
      id: resource.id,
      type: resource.type,
      ...options
    }),
    defaultOptions()
  );
}

export async function create<TAttrs, TRelationships>(
  store: Store,
  type: string,
  options: IBuildNewOptions<TAttrs, TRelationships>) {
  const newRecord = buildNew(type, options);

  await store.update(q => q.addRecord(newRecord), defaultOptions());

  const record = await store.cache.query(q => q.findRecord(newRecord), defaultOptions());

  return record;
}

// Example:
// buildNew('projects', {
//   attributes: { name: 'My First Project' },
//   relationships: {
//     owner: { type: 'users', id: '1' },
//     products: [ { type: 'products', id: '2' } ]
//   }
// });
export function buildNew<TAttrs, TRelationships>(type: string, options: IBuildNewOptions<TAttrs, TRelationships>) {
  const attributes = options.attributes || {};
  const relationMap = options.relationships || {};

  const relationships = Object.keys(relationMap).reduce((result, relationName) => {
    const relationInfo = relationMap[relationName];
    const relationData =
      Array.isArray(relationInfo)
        ? relationInfo.map(info => recordIdentityFrom(info.id, info.type))
        : recordIdentityFrom(relationInfo.id, relationInfo.type);

    result[relationName] = {
      data:relationData
    };

    return result;
  }, {});

  return {
    type,
    attributes,
    relationships
  };
}

interface IOrbitTracking {
  keys: { remoteId: string };
}

export function localIdFromRecordIdentity(recordIdentity: any) {
  const { keys, type, id: maybeLocalId } = recordIdentity;

  if (keys) {
    return recordIdentity.id;
  }

  return keyMap.idFromKeys(type, { remoteId: maybeLocalId }) || recordIdentity.id;
}

// this should return the remoteId, always.
export function idFromRecordIdentity<TType extends string = '', TAttrs extends AttributesObject = {}>(
  recordIdentity: IOrbitTracking & ResourceObject<TType, TAttrs>
): string {
  const keys = recordIdentity.keys;

  if (!keys) {
    // what if id is still a local id? but there are no keys?
    const existingRemoteId = keyMap.idToKey(recordIdentity.type, 'remoteId', recordIdentity.id);

    return existingRemoteId || recordIdentity.id;
  }

  const remoteId = keys.remoteId;

  return remoteId || recordIdentity.id;
}

export function recordIdentityFrom(id: string, type: string) {
  return recordIdentityFromKeys({ keys: { remoteId: id }, type });
}

export interface IIdentityFromKeys {
  type?: string;
  id?: string;
  keys?: any;
}

export function recordIdentityFromKeys({ type, id, keys }: IIdentityFromKeys) {
  const recordIdentity = {
    type,
    keys: keys || { remoteId: keyMap.idToKey(type, 'remoteId', id) },
    id: id || keyMap.idFromKeys(type, keys) || schema.generateId(type),
  };

  keyMap.pushRecord(recordIdentity);

  return recordIdentity;
}