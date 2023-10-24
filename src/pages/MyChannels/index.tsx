import React, { useEffect, useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Table, Image, Modal, Input, Button, notification, Checkbox, Form, Space } from 'antd';
import { EditFilled, DeleteFilled, SearchOutlined } from '@ant-design/icons';
import styles from './index.less';
import * as channelServices from '../../services/channelServices'; // Adjust the path according to your project structure

import EditChannelModal from './components/editChannelModal';
import MultiEditModal from './components/multiEditChannelModal';

interface Channel {
  attributes: {
    CUID: string; // Channel Unique ID also used as the channel number
    name: string;
    id: string;
    logo: string;
    title: string;
  };
  overrides?: {
    channelNumber?: string;
    name?: string;
    id?: string;
    logo?: string;
    title?: string;
    group?: string;
  };
  url: string;
}

const MyChannels: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [editType, setEditType] = useState<'name' | 'logo' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>(() => {
    return [];
  });

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isMultiEditModalVisible, setMultiEditModalVisible] = useState(false);
  const [rowsBeingEdited, setRowsBeingEdited] = useState<string[]>(() => {
    return [];
  });
  const [lastClickedRow, setLastClickedRow] = useState(null);

  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [isSearchActive, setSearchActive] = useState(false);
  const [nameSearchText, setNameSearchText] = useState('');
  const [displayedChannels, setDisplayedChannels] = useState<string[]>(() => {
    return [];
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setNameSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
    setSearchActive(true);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setNameSearchText('');
    if (searchInput.current) {
      searchInput.current.focus();
    }
    setSearchActive(false);
    setSearchedColumn('')
  };

  const handleClearSearch = () => {
    // Clear all active searches here
    setNameSearchText('');
    setSearchActive(false);
    setSearchedColumn('')
  };

  const getColumnSearchProps = (dataIndex, searchText, setSearchText) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}  // Step 3: Assign searchInput to the ref prop of Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      const attributeName = record.attributes[dataIndex] ? record.attributes[dataIndex].toString().toLowerCase() : '';
      const overrideName = record.overrides && record.overrides[dataIndex] ? record.overrides[dataIndex].toString().toLowerCase() : '';
      return attributeName.includes(searchText.toLowerCase()) || overrideName.includes(searchText.toLowerCase());
    },
    onFilterDropdownVisibleChange: visible => {
      if (visible && searchInput.current) {
        setTimeout(() => searchInput.current.select(), 100);
      }
    },
  });

  // Now use displayedChannels for row selection
  const handleRowClick = (record: Channel, index: number, event: React.MouseEvent) => {
    const key = record.attributes.CUID;
    
    if (event.shiftKey && lastClickedRow !== null) {
      const startIndex = displayedChannels.findIndex(channel => channel.attributes.CUID === lastClickedRow.attributes.CUID);
      const endIndex = index;
      const range = [startIndex, endIndex].sort((a, b) => a - b);
      const keysToSelect = displayedChannels.slice(range[0], range[1] + 1).map(channel => channel.attributes.CUID);
      setSelectedRowKeys(prev => Array.from(new Set([...prev, ...keysToSelect])));
    } else {
      setSelectedRowKeys(prev => {
        const newKeys = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
        if(newKeys.length === 1) setEditingChannel( channels.find(channel => channel.attributes.CUID === newKeys[0] ) );
        return newKeys;
      });
      setLastClickedRow(record);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys, newSelectedRows) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    hideSelectAll: false, // optional, to hide the select all checkbox
  };

  useEffect(() => {
    const fetchChannels = async () => {
      setLoading(true);
      try {
        const response = await channelServices.getMyChannels();
        setChannels(response.data);
      } catch (error) {
        console.error('Failed to fetch channels:', error);
        notification.error({
          message: 'Load Failed',
          description: 'Failed to load channels. Please try again later.',
        });
      }
      setLoading(false);
    };

    fetchChannels();
  }, []);

  useEffect(() => {
    if (isSearchActive) {
      const filteredChannels = channels.filter(channel => {
        const attributeName = channel.attributes[searchedColumn] ? channel.attributes[searchedColumn].toString().toLowerCase() : '';
        const overrideName = channel.overrides && channel.overrides[searchedColumn] ? channel.overrides[searchedColumn].toString().toLowerCase() : '';
        return attributeName.includes(nameSearchText.toLowerCase()) || overrideName.includes(nameSearchText.toLowerCase());
      });
      setDisplayedChannels(filteredChannels);
    } else {
      setDisplayedChannels(channels);
    }
  }, [channels, isSearchActive, nameSearchText]); // Add other dependencies if needed


  const handleSave = async () => {
    if (editingChannel && editType) {
      const updatedChannels = channels.map((channel) => {
        if (channel === editingChannel) {
          return {
            ...channel,
            overrides: {
              ...channel.overrides,
              [editType]: editValue,
            },
          };
        }
        return channel;
      });
      setChannels(updatedChannels);
      try {
        await channelServices.updateMyChannels({ data: updatedChannels });
        notification.success({
          message: 'Save Successful',
          description: 'Channel updated successfully.',
        });
      } catch (error) {
        console.error('Failed to save channel:', error);
        notification.error({
          message: 'Save Failed',
          description: 'Failed to save channel. Please try again later.',
        });
      }
    }
    setEditingChannel(null);
    setEditType(null);
    setEditValue('');
  };

  const handleSaveChanges = async (values) => {
    // Apply changes to rowsBeingEdited
    // Update the original data source
    // Send changes to the server
    setEditModalVisible(false);
  };

  const handleCancel = () => {
    setEditModalVisible(false);
    setEditingChannel(null);
    setEditType(null);
    setEditValue('');
  };

  const columns = [
    {
      title: 'Logo',
      key: 'logo',
      width: 50,
      render: (record: Channel) => {
        const logoUrl = record.overrides?.logo || record.attributes.logo;
        return (
          <Image
            src={logoUrl}
            style={{ objectFit: 'contain', padding: '3px', backgroundColor: '#222', borderRadius: '8px' }}
            width={40}
            height={40}
            preview={false}
            onClick={(e) => {
              setEditType('logo');
              setEditValue(logoUrl);
              e.stopPropagation();
              e.preventDefault();
            }}
          />
        );
      },
    },
    {
      title: 'Name',
      dataIndex: ['overrides', 'name'],
      ...getColumnSearchProps('name', nameSearchText, setNameSearchText),
      render: (text: string, record: Channel) => {
        const name = text || record.attributes.name;
        return (
          <span
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              setEditType('name');
              setEditValue(name);
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            {name}
          </span>
        );
      },
    },
    {
      title: 'Channel #',
      dataIndex: ['overrides', 'channelNumber'],
      render: (text, record) => record.overrides?.channelNumber || record.attributes.channelNumber || record.attributes.CUID || 'N/A',
    },
    {
      title: 'Grouping',
      dataIndex: ['overrides', 'grouping'],
      render: (text, record) => record.overrides?.grouping || record.attributes.grouping || 'N/A',
    },
    {
      title: 'Enabled',
      dataIndex: ['overrides', 'enabled'],
      render: (text, record) => {
        const isEnabled = record.overrides?.enabled ?? record.attributes.enabled ?? true;
        return <Checkbox defaultChecked={true} checked={isEnabled} />;
      },
    },
    // Add more columns as needed
  ];

  return (
    <PageContainer ghost>
      <div className={styles.container}>
        <p>Edit each channel individually OR edit multiple at the same time (highlight the rows you want, use the shift key for quick selection)</p>
        <p>What you configure here will be the content of your own M3U (your M3U link is available in the dashboard)</p>
        <Space.Compact block style={{ marginBottom: 16, display: 'flex', width: '100%' }}>
          <Button
            type="primary"
            onClick={() => {
              setRowsBeingEdited(selectedRowKeys.map(key => channels.find(row => row.key === key)));
              selectedRowKeys.length > 1 ? setMultiEditModalVisible(true) : setEditModalVisible(true);
            }}
            disabled={selectedRowKeys.length === 0}
          >
            {selectedRowKeys.length > 1 ? (<><EditFilled /> Multi-Edit Channels</>) : (<><EditFilled /> Edit Channel</>)}
          </Button>
          {selectedRowKeys.length > 0 && (
            <Button
              type="default"
              onClick={() => setSelectedRowKeys([])}
            >
              <DeleteFilled /> Clear Selection ({selectedRowKeys.length})
            </Button>
          )}
          {isSearchActive && (
            <Button
              type="default"
              onClick={handleClearSearch}
            >
              <DeleteFilled /> Reset Filters
            </Button>
          )}
        </Space.Compact>
        <Table
          className={styles.channelTable}
          rowSelection={rowSelection}
          dataSource={channels}
          columns={columns}
          rowKey={(record) => record.attributes.CUID}
          loading={loading}
          pagination={{ pageSize: 50 }} // Adjust pageSize as needed
          size="small"
          rowClassName={(record) => (selectedRowKeys.includes(record.attributes.CUID) ? styles.selectedRow : '')}
          onRow={(record, rowIndex) => {
            return {
              onClick: event => handleRowClick(record, rowIndex, event),
            };
          }}
        />
        <Modal
          title={`Edit ${editType?.toUpperCase()}`}
          visible={!!editingChannel && !!editType}
          onOk={handleSave}
          onCancel={handleCancel}
          confirmLoading={loading}
        >
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
            onPressEnter={handleSave}
          />
        </Modal>
        <EditChannelModal
          open={isEditModalVisible}
          onOk={handleSave}
          onCancel={handleCancel}
          channel={editingChannel}
        />
        <MultiEditModal
          isMultiEditModalVisible={isMultiEditModalVisible}
          setMultiEditModalVisible={setMultiEditModalVisible}
          channels={channels}
          setChannels={setChannels}
          selectedRowKeys={selectedRowKeys}
          setSelectedRowKeys={setSelectedRowKeys}
      />
      </div>
    </PageContainer>
  );
};

export default MyChannels;
