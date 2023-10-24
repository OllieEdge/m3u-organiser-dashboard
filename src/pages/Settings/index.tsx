import React, { useState, useEffect } from 'react';
import { useRequest } from 'umi';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Input, Space, Table, Popconfirm, Typography, Checkbox, Spin, notification, Divider, Progress } from 'antd';
import { LoadingOutlined, PlusCircleFilled } from '@ant-design/icons';
import styles from './index.less';
import * as settingsService from '../../services/settingsServices'; // Import the service functions

interface DataSourceItem {
    key: string;
    url: string;
    enabled: boolean;
}

const SettingsPage: React.FC = () => {
    const [m3uInput, setM3uInput] = useState('');
    const [m3uData, setM3uData] = useState<DataSourceItem[]>([]);
    const [xmltvInput, setXmltvInput] = useState('');
    const [xmltvData, setXmltvData] = useState<DataSourceItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [isFirstRender, setIsFirstRender] = useState(true);

    const { data: dataSettings, loading: loadingSettings, run: dataGet } = useRequest(settingsService.getSettings, {
        manual: true,
    });

    const saveSettings = useRequest(settingsService.saveSettings, {
        manual: true,
        onBefore: () => setSaving(true),
        onAfter: () => setSaving(false),
    });

    useEffect(() => {
        dataGet();
    }, []);

    useEffect(() => {
        if (dataSettings) {
            const newM3uData = dataSettings.m3uFiles.map((file: any) => ({ ...file, key: file.url }));
            const newXmltvData = dataSettings.xmltvFiles.map((file: any) => ({ ...file, key: file.url }));
            if (JSON.stringify(newM3uData) !== JSON.stringify(m3uData)) {
                setM3uData(newM3uData);
            }
            if (JSON.stringify(newXmltvData) !== JSON.stringify(xmltvData)) {
                setXmltvData(newXmltvData);
            }
            setIsFirstRender(false);
        }
    }, [dataSettings]); // data is the only dependency

    useEffect(() => {
        const handleSave = async () => {
            setSaving(true);
            try {
                await saveSettings.run({
                    m3uFiles: m3uData,
                    xmltvFiles: xmltvData,
                });
            } catch (error) {
                console.error('Error saving settings:', error);
                notification.error({
                    message: 'Save Failed',
                    description: 'Failed to save settings. Please try again later.',
                });
            }
            setSaving(false);
        };

        if (!isFirstRender) {
            const handle = setTimeout(() => {
                handleSave();
            }, 500); // Debounce save operations by 500ms

            return () => clearTimeout(handle);
        }
    }, [m3uData, xmltvData, isFirstRender]); // Trigger the effect when m3uData or xmltvData changes or isFirstRender changes


    const handleAddM3U = () => {
        if (m3uData.some(item => item.url === m3uInput)) {
            notification.error({
                message: 'Error',
                description: 'This M3U URL already exists.',
            });
        } else {
            const key = Date.now().toString();
            setM3uData([...m3uData, { key, url: m3uInput, enabled: true }]);
            setM3uInput('');
        }
    };

    const handleAddXMLTV = () => {
        if (xmltvData.some(item => item.url === xmltvInput)) {
            notification.error({
                message: 'Error',
                description: 'This XMLTV URL already exists.',
            });
        } else {
            const key = Date.now().toString();
            setXmltvData([...xmltvData, { key, url: xmltvInput, enabled: true }]);
            setXmltvInput('');
        }
    };

    const handleRemoveM3U = (key: string) => {
        setM3uData(m3uData.filter(item => item.key !== key));
    };

    const handleRemoveXMLTV = (key: string) => {
        setXmltvData(xmltvData.filter(item => item.key !== key));
    };

    const handleToggleEnabledM3U = (key: string) => {
        setM3uData(m3uData.map(item => (item.key === key ? { ...item, enabled: !item.enabled } : item)));
    };

    const handleToggleEnabledXMLTV = (key: string) => {
        setXmltvData(xmltvData.map(item => (item.key === key ? { ...item, enabled: !item.enabled } : item)));
    };

    const columns = [
        {
            title: 'Enabled',
            dataIndex: 'enabled',
            width: '10%',
            render: (_: any, record: DataSourceItem) => (
                <Checkbox checked={record.enabled} onChange={() => handleToggleEnabledM3U(record.key)} />
            ),
        },
        {
            title: 'URL',
            dataIndex: 'url',
            render: (text: string) => <a href={text} target="_blank" rel="noopener noreferrer">{text}</a>,
        },
        {
            title: 'Action',
            key: 'action',
            width: '10%',
            render: (_: any, record: DataSourceItem) => (
                <Popconfirm
                    title="Are you sure delete this item?"
                    onConfirm={() => handleRemoveM3U(record.key)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="primary" danger size="small">
                        Remove
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    const xmltvColumns = [
        {
            title: 'Enabled',
            dataIndex: 'enabled',
            width: '10%',
            render: (_: any, record: DataSourceItem) => (
                <Checkbox checked={record.enabled} onChange={() => handleToggleEnabledXMLTV(record.key)} />
            ),
        },
        {
            title: 'URL',
            dataIndex: 'url',
            render: (text: string) => <a href={text} target="_blank" rel="noopener noreferrer">{text}</a>,
        },
        {
            title: 'Action',
            dataIndex: 'action',
            width: '10%',
            render: (_: any, record: DataSourceItem) => (
                <Popconfirm
                    title="Are you sure delete this item?"
                    onConfirm={() => handleRemoveXMLTV(record.key)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="primary" danger size="small">
                        Remove
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <PageContainer ghost>
            <div className={`${styles.loading} ${!(loadingSettings || saveSettings.loading) ? styles.hidden : ''}`}>
                <LoadingOutlined color={'#'}style={{ fontSize: 24 }} spin />
                <Progress percent={100} status="active" showInfo={false} />
            </div>
            <div className={styles.container}>
                <Divider orientation="left" orientationMargin="0">Your M3U and XMLTV's</Divider>
                <Typography.Title level={5}>M3U Files</Typography.Title>
                <Space.Compact block style={{ marginBottom: 16, display: 'flex', width: '100%' }}>
                    <Input
                        value={m3uInput}
                        onChange={(e) => setM3uInput(e.target.value)}
                        placeholder="Add a M3U URL"
                    />
                    <Button
                        type="primary"
                        icon={<PlusCircleFilled />}
                        onClick={handleAddM3U}
                        disabled={!m3uInput.startsWith('http://') && !m3uInput.startsWith('https://')}
                    >
                        Add
                    </Button>
                </Space.Compact>
                <Table dataSource={m3uData} columns={columns} pagination={false} />

                <Typography.Title level={5} style={{ marginTop: 32 }}>XMLTV Files</Typography.Title>
                <Space.Compact block style={{ marginBottom: 16, display: 'flex', width: '100%' }}>
                    <Input
                        value={xmltvInput}
                        onChange={(e) => setXmltvInput(e.target.value)}
                        placeholder="Add a XMLTV URL (Also know as EPG XML / Guide Data)"
                    />
                    <Button
                        type="primary"
                        icon={<PlusCircleFilled />}
                        onClick={handleAddXMLTV}
                        disabled={!xmltvInput.startsWith('http://') && !xmltvInput.startsWith('https://')}
                    >
                        Add
                    </Button>
                </Space.Compact>
                <Table dataSource={xmltvData} columns={xmltvColumns} pagination={false} />
            </div>
        </PageContainer>
    );
}

export default SettingsPage;
