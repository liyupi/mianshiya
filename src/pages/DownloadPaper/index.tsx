import React, { useState, useEffect } from 'react';
import { message, Button, Card, List } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { history, useSelector, useModel } from 'umi';

import { getPaper } from '@/services/paper';
import type { CurrentUser } from '@/models/user';
import QuestionDetailCard from '@/components/QuestionDetailCard';
import type { QuestionType } from '@/models/question';
import Title from 'antd/es/typography/Title';
import { toLoginPage } from '@/utils/businessUtils';

const DownloadPaper: React.FC = () => {
  const [paper, setPaper] = useState<PaperType>({} as PaperType);
  const [loading, setLoading] = useState<boolean>(true);
  const paperId = history.location.query?.rid as string;
  const showReference = history.location.query?.showReference !== '0';

  const parserQuestions = (origin: any) => {
    let questions: QuestionType[] = [];
    if (origin) {
      for (const key in origin) {
        questions = questions.concat(origin[key]);
      }
    }

    return questions;
  };

  const { pickedQuestions } = useSelector((state) => state.editPaper);
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};

  // 登录才能看（by 一头沉默的猪）
  if (!currentUser?._id) {
    toLoginPage();
    return <></>;
  }

  const toPdf = () => {
    if (document.getElementById('PaperDetailCard')) {
      // @ts-ignore
      window.document.body.innerHTML = document.getElementById('PaperDetailCard').innerHTML;
    }
    window.print();
    // 打印完成后关闭
    if (navigator.userAgent.indexOf('Firefox') >= 0) {
      // 火狐需要额外设置
      const opened = window.open('about:blank', '_self');
      if (opened) {
        opened.opener = null;
        opened.close();
      }
    } else {
      window.opener = null;
      window.open('', '_self');
      window.close();
    }
    return;
    // 发现转成canvas的效果太差了：pdf中文字无法复制，pdf无法分页（因为只有一个canvas对象）
    // see https://stackoverflow.com/questions/44989119/generating-a-pdf-file-from-react-components
    // html2canvas(document.getElementById('PaperDetailCard') as HTMLElement).then((canvas) => {
    //   const dataUrl = canvas.toDataURL('image/png');
    //   const pdf = new jsPDF();
    //   const imgProps = pdf.getImageProperties(dataUrl);
    //   const pdfWidth = pdf.internal.pageSize.getWidth();
    //   const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    //   pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'NONE');
    //   pdf.save(`${paperName}——面试鸭.pdf`);
    //   Modal.success({
    //     title: '下载成功！',
    //     content: '如果没有开始下载，可在页面右上角尝试重新下载',
    //   });
    // });
  };

  const getPaperFromLocal = () => {
    const localPaper = {
      questions: parserQuestions(pickedQuestions),
      name: `${currentUser.nickName}的试卷`,
      detail: `${currentUser.nickName}的试卷`,
      tags: [],
    };
    // @ts-ignore
    setPaper(localPaper);
    setTimeout(() => toPdf(), 0);
  };
  const loadData = async () => {
    if (!paperId) {
      setLoading(false);
      getPaperFromLocal();
      return;
    }
    setLoading(true);
    const res = await getPaper(paperId);
    if (res) {
      setPaper(res);
      setTimeout(() => toPdf(), 0);
    } else {
      message.error('题目加载失败，请刷新重试');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [paperId]);

  return (
    <PageContainer
      header={{
        title: <div>下载试卷</div>,
        extra: (
          <Button type="primary" onClick={toPdf}>
            重新下载
          </Button>
        ),
      }}
    >
      <div id="PaperDetailCard">
        <Card
          title={<Title level={4}>{paper.name}</Title>}
          bordered={false}
          loading={loading}
          bodyStyle={{ paddingBottom: 0 }}
        >
          <p>{paper.detail}</p>
          <List
            rowKey="name"
            itemLayout="vertical"
            dataSource={parserQuestions(paper.questions)}
            pagination={false}
            renderItem={(item, index) => {
              return (
                <List.Item style={{ paddingTop: 16, paddingBottom: 16 }}>
                  <QuestionDetailCard
                    question={item}
                    showReference={showReference}
                    showTitle={false}
                    index={index + 1}
                  />
                </List.Item>
              );
            }}
          />
        </Card>
      </div>
    </PageContainer>
  );
};

export default DownloadPaper;
