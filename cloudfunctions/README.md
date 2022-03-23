# 面试鸭后端云函数

> ⚠️ 前期使用 serverless 后端架构，代码量多了后改为完整 server 部署，所以本目录下代码逻辑可能不是最新。
> 
> 请先阅读 [云函数文档](https://docs.cloudbase.net/cloud-function/introduce.html) 以了解云函数

## 开通云开发

> 云开发是一体化开发环境和工具平台，能够帮你快速开发后台应用

先在 [官网](https://cloud.tencent.com/product/tcb) 开通云开发，获得环境 id，然后将环境 id 填写到本项目根目录的 `cloudbaserc.json` 中。

## 用命令行操作云函数

> 请先阅读：[云开发 CLI 工具文档](https://docs.cloudbase.net/cli-v1/intro.html)

先安装云开发 CLI 工具

```bash
npm i -g @cloudbase/cli
```

本地测试

```bash
tcb fn run --name <functionName> --params "{\"userId\": 1}" --path <functionPath>
```

更新函数代码

```bash
tcb fn code update <functionName> --dir <functionPath>
```

部署函数代码

```bash
tcb fn deploy <functionName> --dir <functionPath>
```

## ES 设计

> 涉及项目机密，仅对 [星球内](https://docs.qq.com/doc/DUG93dVNHbVZjZXpo/) 同学公开

题目表 question_v1

### 搜索示例

GET question/\_search

```json
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "name": ""
          }
        },
        {
          "match": {
            "desc": ""
          }
        }
      ],
      "filter": [
        {
          "term": {
            "reviewStatus": 1
          }
        },
        {
          "term": {
            "isDelete": false
          }
        },
        {
          "term": {
            "tags": "java"
          }
        },
        {
          "term": {
            "tags": "框架"
          }
        }
      ],
      "minimum_should_match": 0
    }
  },
  "from": 0,
  "size": 5,
  "_source": ["name", "_createTime", "desc", "reviewStatus", "priority", "tags"],
  "sort": [
    {
      "priority": {
        "order": "desc"
      }
    },
    {
      "_score": {
        "order": "desc"
      }
    },
    {
      "publishTime": {
        "order": "desc"
      }
    }
  ]
}
```

## 开发 SDK

> 请阅读：[一站式后端服务文档](https://docs.cloudbase.net/api-reference/server/node-sdk/functions.html)

## 部署函数命令

tcb fn deploy esService --dir cloudfunctions/common/esService --force

tcb fn deploy sendEmail --dir cloudfunctions/common/sendEmail --force

tcb fn deploy redisService --dir cloudfunctions/common/redisService --force

tcb fn deploy addQuestion --dir cloudfunctions/question/addQuestion --force

tcb fn deploy addQuestionsToES --dir cloudfunctions/question/addQuestionsToES --force

tcb fn deploy syncQuestionsToES --dir cloudfunctions/question/syncQuestionsToES --force

tcb fn deploy deleteQuestion --dir cloudfunctions/question/deleteQuestion --force

tcb fn deploy favourQuestion --dir cloudfunctions/question/favourQuestion --force

tcb fn deploy reviewQuestion --dir cloudfunctions/question/reviewQuestion --force

tcb fn deploy searchQuestions --dir cloudfunctions/question/searchQuestions --force

tcb fn deploy getRandomQuestion --dir cloudfunctions/question/getRandomQuestion --force

tcb fn deploy shareQuestion --dir cloudfunctions/question/shareQuestion --force

tcb fn deploy updateQuestion --dir cloudfunctions/question/updateQuestion --force

tcb fn deploy viewQuestion --dir cloudfunctions/question/viewQuestion --force

tcb fn deploy listRecommendQuestions --dir cloudfunctions/question/listRecommendQuestions --force

tcb fn deploy getTagsMap --dir cloudfunctions/tag/getTagsMap --force

tcb fn deploy login --dir cloudfunctions/login --force

tcb fn deploy getUser --dir cloudfunctions/user/getUser --force

tcb fn deploy getCaptcha --dir cloudfunctions/getCaptcha --force

tcb fn deploy getSimpleUser --dir cloudfunctions/user/getSimpleUser --force

tcb fn deploy getCurrentUser --dir cloudfunctions/user/getCurrentUser --force

tcb fn deploy listUserCycleRank --dir cloudfunctions/user/listUserCycleRank --force

tcb fn deploy listUserTotalRank --dir cloudfunctions/user/listUserTotalRank --force

tcb fn deploy getUserRank --dir cloudfunctions/user/getUserRank --force

tcb fn deploy updateUser --dir cloudfunctions/user/updateUser --force

tcb fn deploy searchPapers --dir cloudfunctions/paper/searchPapers --force

tcb fn deploy addSearchHistory --dir cloudfunctions/searchHistory/addSearchHistory --force

tcb fn deploy hotSearches --dir cloudfunctions/searchHistory/hotSearches --force

### 举报

tcb fn deploy addReport --dir cloudfunctions/report/addReport --force

tcb fn deploy reviewReport --dir cloudfunctions/report/reviewReport --force

### 回答

tcb fn deploy addComment --dir cloudfunctions/comment/addComment --force

tcb fn deploy deleteComment --dir cloudfunctions/comment/deleteComment --force

tcb fn deploy updateComment --dir cloudfunctions/comment/updateComment --force

tcb fn deploy reviewComment --dir cloudfunctions/comment/reviewComment --force

tcb fn deploy searchComments --dir cloudfunctions/comment/searchComments --force

tcb fn deploy thumbUpComment --dir cloudfunctions/comment/thumbUpComment --force

### 题目修改

tcb fn deploy addQuestionEdit --dir cloudfunctions/questionEdit/addQuestionEdit --force

tcb fn deploy deleteQuestionEdit --dir cloudfunctions/questionEdit/deleteQuestionEdit --force

tcb fn deploy updateQuestionEdit --dir cloudfunctions/questionEdit/updateQuestionEdit --force

tcb fn deploy reviewQuestionEdit --dir cloudfunctions/questionEdit/reviewQuestionEdit --force

tcb fn deploy searchQuestionEdits --dir cloudfunctions/questionEdit/searchQuestionEdits --force

### 回复

tcb fn deploy addReply --dir cloudfunctions/reply/addReply --force

tcb fn deploy deleteReply --dir cloudfunctions/reply/deleteReply --force

tcb fn deploy searchReplies --dir cloudfunctions/reply/searchReplies --force


### 遇到题目

tcb fn deploy addMeetQuestion --dir cloudfunctions/meetQuestion/addMeetQuestion --force

tcb fn deploy deleteMeetQuestion --dir cloudfunctions/meetQuestion/deleteMeetQuestion --force

tcb fn deploy updateMeetQuestion --dir cloudfunctions/meetQuestion/updateMeetQuestion --force

tcb fn deploy searchMeetQuestions --dir cloudfunctions/meetQuestion/searchMeetQuestions --force

### 试卷

tcb fn deploy addPaper --dir cloudfunctions/paper/addPaper --force

tcb fn deploy viewPaper --dir cloudfunctions/paper/viewPaper --force

tcb fn deploy updatePaper --dir cloudfunctions/paper/updatePaper --force

tcb fn deploy deletePaper --dir cloudfunctions/paper/deletePaper --force

### 消息

tcb fn deploy addMessage --dir cloudfunctions/message/addMessage --force

tcb fn deploy countMyMessages --dir cloudfunctions/message/countMyMessages --force

tcb fn deploy searchMessages --dir cloudfunctions/message/searchMessages --force

tcb fn deploy updateAllMessages --dir cloudfunctions/message/updateAllMessages --force

tcb fn deploy updateMessage --dir cloudfunctions/message/updateMessage --force

### 用户积分

tcb fn deploy addUserScore --dir cloudfunctions/userScore/addUserScore --force

tcb fn deploy countUserScoreRank --dir cloudfunctions/userScore/countUserScoreRank --force

## 常用代码片段

1. 云函数事务

```javascript
const transaction = await db.startTransaction();
try {
  await xxx();
  await xxx();
  await transaction.commit();
  return id;
} catch (e) {
  console.error('xxx error', e);
  await transaction.rollback();
  return -1;
}
```
