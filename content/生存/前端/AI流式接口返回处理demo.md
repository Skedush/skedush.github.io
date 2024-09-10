
- 使用fetch工具发送请求
- 返回的文本不是规律的需要处理提取出自己想要的文本
- 大概率返回的是markdown格式的，自己用相关的插件将文本展示。(react可以使用react-markdown)
```javascript
	// 需要用fetch
const fetchData = async () => {
    const payloadData = {  
		"query": "你是谁",  
		"knowledge_base_name": "wenzhou",// 知识库名称  
		"stream": true, // true为流式输出  
		"prompt_name": "default"  //默认传空为default  
	};
    try {
      const url = 'http://[服务地址]/api/v1/chat';
      // const searchHistoryTmp = cloneDeep(nowChat);
      // searchHistoryTmp.sessionId = '5ef0ff061c5642778f7f2d19f39b741b';
      const response = await fetch(url, {
        method: 'POST',
        body: payloadData,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const encode = new TextDecoder('utf-8');
      const reader = response.body?.getReader();
      // 定义本次对话的返回
      let accumulatedText = '';

      // 处理流式返回，读取流
      while (reader) {
        const { done, value } = await reader.read();
        const decodeText = encode.decode(value);

        if (done) {
          console.log('***********************done');
          console.log(value);
          break;
        }
        // 解析返回的数据，流式返回每次获取的decodeText都是不规律的，需要自己去用正则或者其他条件去配对取出想要的文本了
        const text = getReaderText(decodeText);
        if (text) {
        // 将每次读取的文本累加到accumulatedText中，然后每次累加都渲染页面就有打字机效果了
          accumulatedText += text;
          // 将accumulatedText存入state中
	       
        }
      }
    } catch (error) {
      message.error('接口请求失败');
      console.error('Error receiving or rendering stream response:', error);
    }
};

// 将每次读取流式返回的文本处理提取方法，需要根据具体的返回修改条件等
const getReaderText = (inputString: any) => {
    const regex = /"data"\s*:\s*"([^"]*)"/g;
    let result = '';

    // 使用正则表达式进行匹配，并将匹配结果拼接到结果字符串中
    let match;
    while ((match = regex.exec(inputString)) !== null) {
      // 匹配到的内容
      const content = match[1];
      // 将匹配到的内容拼接到结果字符串中,去掉换行。按需自己考量方法或者用更好的办法
      result += content.replace(/\\n/g, '\n');
    }
    // 返回拼接后的结果字符串
    return result;
};
```