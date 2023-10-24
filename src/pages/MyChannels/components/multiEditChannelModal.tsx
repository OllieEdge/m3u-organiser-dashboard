import React, { useState, useEffect } from 'react';
import { Modal, Form, Checkbox, InputNumber, List, Switch, Select } from 'antd';
import Title from 'antd/es/typography/Title';

const {Option} = Select;

interface Channel {
    attributes: {
        CUID: string;
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

interface MultiEditModalProps {
    isMultiEditModalVisible: boolean;
    setMultiEditModalVisible: (isVisible: boolean) => void;
    channels: Channel[];
    setChannels: (channels: Channel[]) => void;
    selectedRowKeys: string[];
    setSelectedRowKeys: (keys: string[]) => void;
}

interface MultiEditFormValues {
    grouping: string;
    enabled: boolean;
    startingChannelNumber: number;
}

const MultiEditModal: React.FC<MultiEditModalProps> = ({
    isMultiEditModalVisible,
    setMultiEditModalVisible,
    channels,
    setChannels,
    selectedRowKeys,
    setSelectedRowKeys,
}) => {
    const [multiEditForm] = Form.useForm<MultiEditFormValues>();
    const [formValues, setFormValues] = useState<MultiEditFormValues>({
        grouping: '',
        enabled: true,
        startingChannelNumber: 1,
    });
    const [previewData, setPreviewData] = useState<Channel[]>([]);

    useEffect(() => {
        if (isMultiEditModalVisible) {
            // Calculate the preview data when the modal opens
            const updatedPreviewData = channels
                .filter(channel => selectedRowKeys.includes(channel.attributes.CUID))
                .map((channel, index) => ({
                    ...channel,
                    overrides: {
                        ...channel.overrides,
                        group: formValues.grouping,
                        enabled: formValues.enabled,
                        channelNumber: (formValues.startingChannelNumber + index).toString(),
                    },
                }));
            setPreviewData(updatedPreviewData);
        } else {
            // Reset form and preview data when modal is closed
            multiEditForm.resetFields();
            setPreviewData([]);
        }
    }, [isMultiEditModalVisible, channels, selectedRowKeys, formValues, multiEditForm]);

    const handleSaveChanges = async () => {
        const values = multiEditForm.getFieldsValue();
        const updatedChannels = channels.map((channel) => {
            if (selectedRowKeys.includes(channel.attributes.CUID)) {
                const index = selectedRowKeys.indexOf(channel.attributes.CUID);
                return {
                    ...channel,
                    overrides: {
                        ...channel.overrides,
                        group: values.grouping,
                        enabled: values.enabled,
                        channelNumber: (values.startingChannelNumber + index).toString(),
                    },
                };
            }
            return channel;
        });

        setChannels(updatedChannels);
        setMultiEditModalVisible(false);
        setSelectedRowKeys([]);
        // Here, you should send the updates to the server as well
        // ...
    };


    return (

        <Modal
            title="Edit Channels"
            open={isMultiEditModalVisible}
            onOk={handleSaveChanges}
            onCancel={() => setMultiEditModalVisible(false)}
            width={800}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Form
                    form={multiEditForm}
                    initialValues={formValues}
                    onValuesChange={(_, allValues) => setFormValues(allValues)}
                    style={{ flex: 1 }}
                >
                    <Form.Item name="grouping" label="Grouping">
                        <Select>
                            <Option value="Sport">Sport</Option>
                            <Option value="Kids">Kids</Option>
                            <Option value="News">News</Option>
                            <Option value="Entertainment">Entertainment</Option>
                            <Option value="Documentaries">Documentaries</Option>
                            <Option value="Movies">Movies</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="enabled" label="Enabled" valuePropName="checked">
                        <Checkbox />
                    </Form.Item>
                    <Form.Item name="startingChannelNumber" label="Starting Channel #">
                        <InputNumber min={1} />
                    </Form.Item>
                </Form>
                <div style={{ flex: 1, marginLeft: 16 }}>
                    <List
                        size="small"
                        header={<Title level={5}>Preview Changes</Title>}
                        bordered
                        dataSource={previewData}
                        renderItem={item => (
                            <List.Item>
                                <List.Item.Meta
                                    title={`${item.overrides?.name || item.attributes.name} (#${item.overrides?.channelNumber || item.attributes.CUID})`}
                                    description={item.overrides?.group}
                                />
                                <Switch checked={item.overrides?.enabled} disabled />
                            </List.Item>
                        )}
                        style={{ maxHeight: '50vh', overflowY: 'auto' }}
                    />

                </div>
            </div>
        </Modal>
    );
};

export default MultiEditModal;
