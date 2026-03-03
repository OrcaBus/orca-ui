import type { Meta, StoryObj } from '@storybook/react';
import { ModuleNavbar, SideNavbar } from '@/components/navigation/navbar';
import { withRouter, reactRouterParameters } from 'storybook-addon-remix-react-router';
import navigation, { libraryModuleNavigation } from '@/utils/navigation';

const meta: Meta = {
  title: 'Naviagtion/ModuleNavbar',
  component: SideNavbar,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { projectId: '42' },
        searchParams: { tab: 'smapleId' },
        state: { fromPage: 'portal' },
      },
      routing: {
        path: '/potal/project/:projectId',
        handle: 'portal',
      },
    }),
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  // argTypes: {
  //   backgroundColor: { control: 'color' },
  // },
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {},
  decorators: [withRouter],
};

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const SimpleSideNavbar: Story = {
  args: {
    navigation,
  },
};

export const LibraryModuleNavbar: Story = {
  render: () => <ModuleNavbar navigation={libraryModuleNavigation} />,
};
