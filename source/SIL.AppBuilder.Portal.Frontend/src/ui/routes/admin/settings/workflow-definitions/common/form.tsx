import * as React from 'react';
import { compose } from 'recompose';
import { Checkbox, Dropdown } from 'semantic-ui-react';
import { withTemplateHelpers, Mut, Toggle } from 'react-action-decorators';

import { withTranslations, i18nProps } from '@lib/i18n';

import {
  query,
  buildOptions,
  withLoader,
  attributesFor,
  StoreTypeResource,
  WorkflowDefinitionResource
} from '@data';


interface IOwnProps {
  workflowDefinition: WorkflowDefinitionResource;
  storeType: StoreTypeResource;
  storeTypes: StoreTypeResource[];
  onSubmit: (attributes: IState, onSuccess?: () => void) => void;
  onCancel: () => void;
}

interface IState {
  name?: string;
  description?: string;
  storeType?: StoreTypeResource;
  storeTypeError?: string;
  workflowScheme?: string;
  workflowBusinessFlow?: string;
  enabled?: boolean;
}

type IProps =
  & i18nProps
  & IOwnProps;


@withTemplateHelpers
class WorkflowDefinitionForm extends React.Component<IProps, IState> {
  mut: Mut;
  toggle: Toggle;

  constructor(props: IProps) {
    super(props);

    const { workflowDefinition, storeType } = props;

    if (workflowDefinition) {

      const {
        name, description,
        workflowScheme, workflowBusinessFlow,
        enabled
      } = attributesFor(workflowDefinition);

      this.state = {
        name,
        description,
        workflowScheme,
        workflowBusinessFlow,
        enabled,
        storeType
      };

    } else {
      this.state = {
        name: '',
        description: '',
        workflowScheme: '',
        workflowBusinessFlow: '',
        enabled: false,
        storeType: null,
        storeTypeError: ''
      };
    }

  }

  isValidForm = () => {
    const { storeType } = this.state;
    if (!storeType) {
      this.setState({ storeTypeError: 'Cannot be empty' });
    } else {
      this.setState({ storeTypeError: '' });
    }
    return storeType;
  }

  submit = async (e) => {
    e.preventDefault();

    const { onSubmit } = this.props;

    if (this.isValidForm()) {
      onSubmit(this.state, this.cleanForm);
    }
  }

  cleanForm = () => {
    this.setState({
      name: '',
      description: '',
      workflowScheme: '',
      workflowBusinessFlow: '',
    });
  }

  cancel = (e) => {
    e.preventDefault();
    const { onCancel } = this.props;
    onCancel();
  }

  storeTypeSelection = storeType => e => {
    this.setState({
      storeType: storeType
    });
  }

  render() {
    const { mut, toggle } = this;

    const {
      name, description, workflowScheme,
      workflowBusinessFlow,
      enabled,
      storeType, storeTypeError
    } = this.state;

    const { t, storeTypes, workflowDefinition } = this.props;

    const { name: StoreTypeName } = attributesFor(storeType);

    return (
      <>
        <h2>
          {
            t(workflowDefinition ?
              'admin.settings.workflowDefinitions.edit' :
              'admin.settings.workflowDefinitions.add'
            )
          }
        </h2>
        <div className='flex w-60'>
          <form data-test-form className='ui form flex-grow'>

            <div className='field m-b-xl'>
              <label>{t('admin.settings.workflowDefinitions.name')}</label>
              <input
                data-test-wf-name
                type='text'
                value={name || ''}
                onChange={mut('name')} />
            </div>

            <div className='field m-b-xl'>
              <label>{t('admin.settings.workflowDefinitions.storeType')}</label>
              <div className='w-100 thin-bottom-border'>
                <Dropdown
                  className='w-100 no-borders'
                  data-test-wf-storetype
                  text={StoreTypeName}
                >
                  <Dropdown.Menu>
                    {
                      storeTypes.map((u, i) => {
                        const { name: name } = attributesFor(u);
                        return <Dropdown.Item key={i} text={name} onClick={this.storeTypeSelection(u)} />;
                      })
                    }
                  </Dropdown.Menu>

                </Dropdown>
              </div>
              <div className='error'>{storeTypeError}</div>
            </div>


            <div className='field m-b-xl'>
              <label>{t('admin.settings.workflowDefinitions.description')}</label>
              <input
                data-test-wf-description
                type='text'
                value={description || ''}
                onChange={mut('description')} />
            </div>

            <div className='field m-b-xl'>
              <label>{t('admin.settings.workflowDefinitions.workflowScheme')}</label>
              <input
                data-test-wf-workflow-scheme
                type='text'
                value={workflowScheme || ''}
                onChange={mut('workflowScheme')}
              />
            </div>

            <div className='field m-b-xl'>
              <label>{t('admin.settings.workflowDefinitions.workflowBusinessFlow')}</label>
              <input
                data-test-wf-workflow-business-flow
                type='text'
                value={workflowBusinessFlow || ''}
                onChange={mut('workflowBusinessFlow')}
              />
            </div>

            <div className='flex m-b-xl'>
              <div className='flex-row align-items-center'>
                <div className='p-r-lg'>
                  <h3>
                    {t('admin.settings.workflowDefinitions.enabled')}
                  </h3>
                  <p className='input-info'>
                    {t('admin.settings.workflowDefinitions.enabledDescription')}
                  </p>
                </div>
                <div>
                  <Checkbox
                    data-test-wf-enabled
                    toggle
                    name='enabled'
                    defaultChecked={enabled}
                    onChange={toggle('enabled')}
                  />
                </div>
              </div>
            </div>

            <div className='m-b-xl'>
              <button
                data-test-wf-submit
                className='ui button p-t-md p-b-md p-l-lg p-r-lg'
                onClick={this.submit}>
                {workflowDefinition ?
                  t('admin.settings.workflowDefinitions.edit') :
                  t('admin.settings.workflowDefinitions.add')}
              </button>

              <button
                data-test-wf-cancel
                className='ui button p-t-md p-b-md p-l-lg p-r-lg'
                onClick={this.cancel}>
                {t('common.cancel')}
              </button>
            </div>

          </form>
        </div>
      </>
    );
  }
}

export default compose(
  withTranslations,
  query(() => ({
    storeTypes: [
      q => q.findRecords('storeType'), buildOptions()
    ],
  })),
  withLoader(({ storeTypes }) => !storeTypes)
)(WorkflowDefinitionForm);