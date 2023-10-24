import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Switch, Button } from 'antd';

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

interface EditChannelModalProps {
  open: boolean;
  onOk: (channel: Channel) => void;
  onCancel: () => void;
  channel: Channel | null;
}

const EditChannelModal: React.FC<EditChannelModalProps> = ({ open, onOk, onCancel, channel }) => {
  const [form] = Form.useForm();
  const [logoUrl, setLogoUrl] = useState(channel?.overrides?.logo || channel?.attributes.logo || '');

  useEffect(() => {
    if (channel) {
      setLogoUrl(channel.overrides?.logo || channel.attributes.logo);
      form.setFieldsValue({
        ...channel.overrides,
        logo: channel.overrides?.logo || channel.attributes.logo,
        name: channel.overrides?.name || channel.attributes.name,
        channelNumber: channel.overrides?.channelNumber || channel.attributes.CUID,
        grouping: channel.overrides?.group,
      });
    }
  }, [channel, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onOk({ 
        ...channel, 
        overrides: {
          ...channel?.overrides,
          ...values,
          group: values.grouping,
          channelNumber: values.channelNumber.toString(),
        }
      } as Channel);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoUrl(e.target.value);
  };

  return (
    <Modal
      title="Edit Channel"
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Save Changes
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="logo"
          label="Logo URL"
          rules={[{ required: true, message: 'Please input the logo URL!' }]}
        >
          <Input onChange={handleLogoChange} />
        </Form.Item>
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <img src={logoUrl} alt="Logo Preview" style={{ maxWidth: '100%', maxHeight: 100 }} />
        </div>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please input the channel name!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="channelNumber"
          label="Channel #"
          rules={[{ required: true, message: 'Please input the channel number!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="grouping"
          label="Grouping"
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="enabled"
          label="Enabled"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditChannelModal;
