import * as React from 'react';
import { compose, withProps } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import {
  OrganizationResource, UserResource, RoleResource,
  UserRoleResource,
  attributesFor
} from '@data';
import { ROLE } from '@data/models/role';
import { isEmpty } from '@lib/collection';
import { withTranslations, i18nProps } from '@lib/i18n';
import { RequireRole } from '@ui/components/authorization';

import RoleSelect from './role-select';
import ActiveRolesDisplay from './active-roles-display';

interface INeededProps {
  user: UserResource;
  organizations: OrganizationResource[];
  roles: RoleResource[];
}

interface IOwnProps {
  userRoles: UserRoleResource[];
}

type IProps =
& INeededProps
& IOwnProps
& i18nProps;

class MultiRoleSelect extends React.Component<IProps> {
  render() {
    const { roles, userRoles, organizations, user, t } = this.props;

    if (isEmpty(organizations)) {
      return t('errors.orgMembershipRequired');
    }

    return organizations.map(( organization, i ) => {
      const roleProps = {
        organization,
        user,
        roles,
        userRoles
      };

      return (
        <div key={i}>
          <label className='bold m-b-sm'>
            {attributesFor(organization).name}
          </label>

          <RequireRole
            roleName={ROLE.OrganizationAdmin}
            forOrganization={organization}
            componentOnForbidden={() => {
              return (
                <>
                  <br />
                  <ActiveRolesDisplay { ...roleProps } />
                </>
              );
            }}>
            <RoleSelect { ...roleProps } />
          </RequireRole>
        </div>
      );
    });
  }
}

export default compose<IProps, INeededProps>(
  withTranslations,
  // share one set of userRoles for the entire list.
  // otherwise the RoleSelect's own withUserRoles will
  // make a call to get the userRoles as a convient default
  withOrbit((props: INeededProps) => {
    const { user } = props;

    return {
      userRoles: q => q.findRelatedRecords(user, 'userRoles'),
    };
  }),
)(MultiRoleSelect);
