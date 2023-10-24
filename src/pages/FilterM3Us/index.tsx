import React, { useState } from 'react';
import { useRequest } from 'umi';
import { request } from 'umi';
import { PageContainer } from '@ant-design/pro-components';
import styles from './index.less';
import { Transfer, Select, Button, Badge, Divider, Typography } from 'antd';
import { DesktopOutlined } from '@ant-design/icons';
const { Title } = Typography;

const FilterM3UPage: React.FC = () => {
  const { data, error, loading } = useRequest('http://localhost:3440/m3u/current');

  // state for Transfer components
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  
  // state for dropdown menu
  const [currentGroup, setCurrentGroup] = useState<string | null>(null);
  const [initialChannelsSet, setInitialChannelsSet] = useState<boolean | null>(null);
  const [initialGroupsSet, setInitialGroupsSet] = useState<boolean | null>(null);

  const handleGroupSelection = (targetKeys: string[]) => {
    setSelectedGroups(targetKeys);
  };

  const handleChildrenSelection = (targetKeys: string[]) => {
    setSelectedChildren(targetKeys);
  };

  const sendToServer = async () => {
    const payload = {
      groups: selectedGroups,
      children: selectedChildren
    };
    // Send data to your server
    await request('http://localhost:3440/m3u/current', {
      method: 'POST',
      data: payload,
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const groupData = data.treeData.map((item: any) => ({
    key: item.key,
    title: item.title,
    channels: item.children.length,
  }));

  if(!initialGroupsSet && selectedGroups.length === 0 && data?.selectedGroupsAndChannels?.groups?.length) {
    setSelectedGroups(data.selectedGroupsAndChannels.groups)
    setInitialGroupsSet(true);
  }
  if(!initialChannelsSet && selectedChildren.length === 0 && data?.selectedGroupsAndChannels?.children?.length) {
    setSelectedChildren(data.selectedGroupsAndChannels.children);
    setInitialChannelsSet(true);
  } 

  const childrenData = currentGroup && currentGroup !== 'all'
    ? data.treeData.find((item: any) => item.key === currentGroup)?.children || []
    : currentGroup === 'all' ? selectedGroups.map( groupName => data.treeData.find((item: any) => item.key === groupName)?.children || []).flat() : []

  return (
    <PageContainer ghost>
      <div className={styles.container}>
        <p>Listed below are all the channels groups from your M3U sources. Because M3U can contain large amounts of channels, we first filter by groups then you can filter individual channels once you&apos;ve chosen the groups, you can of course select all groups!</p>
        <p>Once you&apos;ve selected your group, you&apos;ll be able to filter individual channels.</p>
        <Divider orientation="left" orientationMargin="0">Step 1 - Filter Groups</Divider>
        <Transfer
          dataSource={groupData}
          targetKeys={selectedGroups}
          onChange={handleGroupSelection}
          showSearch={true}
          render={item => ( <span>{item.title} <Badge style={{ backgroundColor: '#52c41a', height:'14px', fontSize:'10px', lineHeight: '14px', padding:'0 4px' }} count={item.channels} /></span> )}
          locale={{ itemUnit: 'Channel Group', itemsUnit: 'Channel Groups', searchPlaceholder: 'Search Channel Groups' }}
          listStyle={{
            width: '50%',
            height: '40vh',
          }}
        />

        {selectedGroups && selectedGroups.length > 0 && (
          <div>
            <Divider orientation="left" orientationMargin="0">Step 2 - Filter Channels</Divider>
            <p>Select a channel group to filter individual channels, you can select all if you want to bring them all across.</p>
            <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'center'}}>
        <Select
          placeholder="Select Channel Group"
          style={{ width: 'calc(50% - 20px)', margin: '0 0 16px 0' }}
          onChange={(value) => setCurrentGroup(value as string)}
        >
          {selectedGroups.map((key) => {
            const group = data.treeData.find((item: any) => item.key === key);
            return <Select.Option key={key} value={key}>{group?.title}</Select.Option>;
          })}
          <Select.Option key='all' value='all'>Show All (Careful with this!)</Select.Option>
        </Select>
        <div style={{ width: 'calc(50% - 20px)', textAlign:'left', marginBottom: '16px', display:'flex', gap:'8px' }}><DesktopOutlined ></DesktopOutlined><Title style={{marginBottom: 0}}level={5}>My Channels</Title><Badge count={selectedChildren?.length} show={selectedChildren?.length}  style={{ height:'18px', fontSize:'14px', lineHeight: '18px', marginTop: '3px', backgroundColor: '#52c41a' }}></Badge></div>
        </div>

        <Transfer
          dataSource={childrenData}
          targetKeys={selectedChildren}
          onChange={handleChildrenSelection}
          showSearch={true}
          render={item => item.title}
          locale={{ itemUnit: 'Channel', itemsUnit: 'Channels', searchPlaceholder: 'Search Channels' }}
          listStyle={{
            width: '50%',
            height: '40vh',
          }}
        />
        <Button style={{marginTop: '16px'}} type="primary" onClick={sendToServer}>Send to Server</Button>
        </div>
        )}

      </div>
    </PageContainer>
  );
};

export default FilterM3UPage;