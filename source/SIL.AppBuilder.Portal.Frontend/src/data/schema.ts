import { KeyMap, Schema, SchemaSettings } from '@orbit/data';

export const keyMap = new KeyMap();

const schemaDefinition: SchemaSettings = {
  models: {
    organizationInvite: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        ownerEmail: { type: 'string' },

        // The Scriptura API should not allow setting of the token
        // it should be backend-generated only
        token: { type: 'string' },
        expiresAt: { type: 'date' }
      }
    },
    organization: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        websiteUrl: { type: 'string' },
        buildEngineUrl: { type: 'string' },
        logoUrl: { type: 'string' },

        makePrivateByDefault: { type: 'boolean' },
        useSilBuildInfrastructure: { type: 'boolean' },

        // note, that the Build Engine API access token probably should
        // never be *received* from the Scriptura API
        buildEngineApiAccessToken: { type: 'string' },

        // unpresisted, send-only attribute for when a user accepts an
        // invite to create an organization
        token: { type: 'string' },

        // filter-keys - throw-away
        scopeToCurrentUser: { type: 'string' },
      },
      relationships: {
        owner: { type: 'hasOne', model: 'user', inverse: 'ownedOrganizations' },
        users: { type: 'hasMany', model: 'user', inverse: 'organizations' },
        projects: { type: 'hasMany', model: 'user', inverse: 'organization'},
        userMemberships: { type: 'hasMany', model: 'organization-membership', inverse: 'organization' },
        groups: { type: 'hasMany', model: 'group', inverse: 'owner' },
        organizationProductDefinitions: { type: 'hasMany', model: 'organizationProductDefinition', inverse: 'organization'},
        organizationStores: { type: 'hasMany', model: 'organizationStore', inverse: 'organization' }
      }
    },
    organizationMembership: {
      keys: { remoteId: {} },
      attributes: {},
      relationships: {
        user: { type: 'hasOne', model: 'user', inverse: 'organizationMemberships' },
        organization: { type: 'hasOne', model: 'organization', inverse: 'userMemberships' },
      }
    },
    groupMembership: {
      keys: { remoteId: {} },
      attributes: {},
      relationships: {
        user: { type: 'hasOne', model: 'user', inverse: 'groupMemberships' },
        group: { type: 'hasOne', model: 'group', inverse: 'groupMemberships' }
      }
    },
    organizationProductDefinition: {
      keys: { remoteId: {} },
      attributes: {},
      relationships: {
        organization: { type: 'hasOne', model: 'organization', inverse: 'organizationProductDefinitions'},
        productDefinition: { type: 'hasOne', model: 'productDefinition', inverse: 'organizationProductDefinitions'},
      }
    },
    organizationStore: {
      keys: { remoteId: {} },
      attributes: {},
      relationships: {
        organization: { type: 'hasOne', model: 'organization', inverse: 'organizationStores' },
        store: { type: 'hasOne', model: 'store', inverse: 'organizationStores'}
      }
    },
    project: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        status: { type: 'string' },
        dateCreated: { type: 'date'},
        dateArchived: { type: 'date'},
        language: { type: 'string' },
        type: { type: 'string'},
        description: { type: 'string' },
        automaticBuilds: { type: 'boolean' },
        allowDownloads: { type: 'boolean' },
        location: { type: 'string' },
        isPublic: { type: 'boolean' },
        // filter keys
        ownerId: { type: 'string' }
      },
      relationships: {
        tasks: { type: 'hasMany', model: 'task', inverse: 'project'},
        products: { type: 'hasMany', model: 'product', inverse: 'project' },
        organization: { type: 'hasOne', model: 'organization', inverse: 'projects'},
        owner: { type: 'hasOne', model: 'user', inverse: 'projects' },
        group: { type: 'hasOne', model: 'group', inverse: 'projects' },
        reviewers: { type: 'hasMany', model: 'reviewer', inverse: 'project' },
        type: { type: 'hasOne', model: 'applicationType', inverse: 'projects'}
      }
    },
    applicationType: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        description: { type: 'string' }
      },
      relationships: {
        projects: { type: 'hasMany', model: 'project', inverse: 'type' },
        productDefinitions: { type: 'hasMany', model: 'productDefinition', inverse: 'type' }
      }
    },
    product: {
      keys: { remoteId: {} },
      attributes: {
        dateCreated: { type: 'string'},
        dateUpdated: { type: 'string'},
        datePublished: { type: 'string'},
      },
      relationships: {
        project: { type: 'hasOne', model: 'project', inverse: 'products' },
        productDefinition: { type: 'hasOne', model: 'productDefinition', inverse: 'products' },
        store: { type: 'hasOne', model: 'store', inverse: 'products' },
        storeLanguage: { type: 'hasOne', model: 'storeLanguage', inverse: 'products' },
        artifacts: { type: 'hasMany', model: 'productArtifact', inverse: 'product' },
        tasks: { type: 'hasMany', model: 'task', inverse: 'project' }, // TODO: doesn't exist in DB
      }
    },
    productArtifact: {
      keys: { remoteId: {} },
      attributes: {
        artifactType: { type: 'string' },
        url: { type: 'string' },
        fileSize: { type: 'number' },
        contentType: { type: 'string' },
        dateCreated: { type: 'string' },
        dateUpdated: { type: 'string' }
      },
      relationships: {
        product: { type: 'hasOne', model: 'product', inverse: 'artifacts' }
      }
    },
    productDefinition: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        description: { type: 'string' },
      },
      relationships: {
        products: { type: 'hasMany', model: 'product', inverse: 'productDefinition' },
        organizationProductDefinitions: { type: 'hasMany', model: 'organizationProductDefinition', inverse: 'productDefinition'},
        type: { type: 'hasOne', model: 'applicationType', inverse: 'productDefinitions' }
      }
    },
    store: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        description: { type: 'string' }
      },
      relationships: {
        organizationStores: { type: 'hasMany', model: 'organizationStore', inverse: 'store' },
        storeType: { type: 'hasOne', model: 'storeType', inverse: 'stores' },
        products: { type: 'hasMany', model: 'product', inverse: 'store'}
      }
    },
    storeLanguage: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        description: { type: 'string' }
      },
      relationships: {
        storeType: { type: 'hasOne', model: 'storeType', inverse: 'storeTypes' },
        products: { type: 'hasMany', model: 'product', inverse: 'storeLanguage' },
      }
    },
    storeType: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        description: { type: 'string' }
      },
      relationships: {
        stores: { type: 'hasMany', model: 'store', inverse: 'storeType'},
        storeLanguages: { type: 'hasMany', model: 'storeLanguage', inverse: 'storeType' },

      }
    },
    task: {
      keys: { remoteId: {} },
      attributes: {
        status: { type: 'string' },
        waitTime: { type: 'number' }
      },
      relationships: {
        project: { type: 'hasOne', model: 'project', inverse: 'tasks'},
        product: { type: 'hasOne', model: 'product', inverse: 'tasks'},
        assigned: { type: 'hasOne', model: 'user', inverse: 'assignedTasks' }
      }
    },
    notification: {
      keys: { remoteId: {} },
      attributes: {
        title: { type: 'string' },
        description: { type: 'string' },
        time: { type: 'date' },
        link: { type: 'string' },
        isViewed: { type: 'boolean' },
        show: { type: 'boolean' }
      }
    },
    role: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string'}
      },
      relationships: {
        users: { type: 'hasMany', model: 'user', inverse: 'role'}
      }
    },
    group: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' }
      },
      relationships: {
        groupMemberships: { type: 'hasMany', model: 'groupMembership', inverse: 'group' },
        projects: { type: 'hasMany', model: 'project', inverse: 'group' },
        owner: { type: 'hasOne', model: 'organization', inverse: 'groups' },
      }
    },
    reviewer: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        email: { type: 'string' }
      },
      relationships: {
        project: { type: 'hasOne', model: 'project', inverse: 'reviewers' }
      }
    },
    user: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        givenName: { type: 'string' },
        familyName: { type: 'string' },
        auth0Id: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string'},
        isLocked: { type: 'boolean' },
        profileVisibility: { type: 'number' },
        emailNotification: { type: 'boolean'},
        timezone: { type: 'string' },
        localization: { type: 'string' },
        decimalSeparator: { type: 'string' },
      },
      relationships: {
        ownedOrganizations: { type: 'hasMany', model: 'organization', inverse: 'owner' },
        organizationMemberships: { type: 'hasMany', model: 'organizationMembership', inverse: 'user' },
        groupMemberships: { type: 'hasMany', model: 'groupMembership', inverse: 'user' },
        organizations: { type: 'hasMany', model: 'organization', inverse: 'users' },
        assignedTasks: { type: 'hasMany', model: 'task', inverse: 'assigned' },
        projects: { type: 'hasMany', model: 'project', inverse: 'owner' },
        role: { type: 'hasOne', model: 'role', inverse: 'users'},
        groups: { type: 'hasMany', model: 'group', inverse: 'users'}
      }
    }
  }
};

export const schema = new Schema(schemaDefinition);
