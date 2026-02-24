import type { Meta, StoryObj } from '@storybook/react';
import { IconMultipleSelect, SingleSelect, SearchableSelect } from '@/components/common/select';
import { ListBulletIcon } from '@heroicons/react/24/outline';

const people = [
  { label: 'Wade Cooper', value: '1', secondaryLabel: 'Lead Developer' },
  { label: 'Arlene Mccoy', value: '2', secondaryLabel: 'Frontend Developer' },
  { label: 'Devon Webb', value: '3', secondaryLabel: 'Backend Developer', disabled: true },
  { label: 'Tom Cook', value: '4' },
];

const meta: Meta = {
  title: 'Common/Select',
  component: SingleSelect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SelectStory: Story = {
  render: () => {
    return (
      <SingleSelect
        value={{ label: 'Wade Cooper', value: '1', secondaryLabel: 'Lead Developer' }}
        options={people}
        onChange={(value) => console.log(value)}
      />
    );
  },
};

export const SelectWithGroupLabelStory: Story = {
  render: () => {
    return (
      <SingleSelect
        value={{ label: 'Wade Cooper', value: '1', secondaryLabel: 'Lead Developer' }}
        options={people}
        groupLabel='Select Label'
        onChange={(value) => console.log(value)}
      />
    );
  },
};

export const IconMultipleSelectStory: Story = {
  render: () => {
    return (
      <IconMultipleSelect
        BtnIcon={ListBulletIcon}
        selectedItemValues={['1', '2']}
        options={people}
        onApply={(value) => console.log(value)}
      />
    );
  },
};

export const SearchableSelectStory: Story = {
  render: () => {
    return (
      <SearchableSelect
        options={people.map((person) => person.label)}
        value={null}
        onChange={(value) => console.log(value)}
      />
    );
  },
};
