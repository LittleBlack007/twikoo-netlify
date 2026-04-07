/**
 * 星座运势 - Netlify 云函数
 * 接口: GET /.netlify/functions/horoscope?zodiac=白羊座&time=today
 * 数据来源：xxapi.cn → 本地兜底数据
 */

// 星座中文名 → 英文名映射表
const ZODIAC_EN = {
  '白羊座':'aries','金牛座':'taurus','双子座':'gemini','巨蟹座':'cancer',
  '狮子座':'leo','处女座':'virgo','天秤座':'libra','天蝎座':'scorpio',
  '射手座':'sagittarius','摩羯座':'capricorn','水瓶座':'aquarius','双鱼座':'pisces'
}

/** 本地兜底运势数据（12星座 × 4个时段） */
const fallbackData = {
  aries:   { today:{love:4,work:3,health:5,money:3,advice:'今天适合主动出击，不要犹豫。',lucky:'红色',luckyNum:7,match:'射手座'},week:{love:3,work:4,health:4,money:3,advice:'本周注意平衡工作与生活。',lucky:'红色',luckyNum:3,match:'狮子座'},month:{love:4,work:5,health:3,money:4,advice:'本月事业运旺盛，把握机会。',lucky:'橙色',luckyNum:1,match:'水瓶座'},year:{love:4,work:4,health:4,money:3,advice:'今年要勇往直前，但也要学会等待。',lucky:'红色',luckyNum:9,match:'天秤座'}},
  taurus:  { today:{love:3,work:4,health:4,money:5,advice:'今天财务运势不错，可做些投资规划。',lucky:'绿色',luckyNum:2,match:'处女座'},week:{love:4,work:3,health:4,money:4,advice:'本周适合稳扎稳打。',lucky:'棕色',luckyNum:6,match:'摩羯座'},month:{love:3,work:4,health:5,money:4,advice:'本月适合深耕细作。',lucky:'绿色',luckyNum:4,match:'双鱼座'},year:{love:4,work:4,health:4,money:5,advice:'今年财运亨通，但别忘了享受生活。',lucky:'米色',luckyNum:8,match:'巨蟹座'}},
  gemini:  { today:{love:5,work:3,health:3,money:4,advice:'今天社交运极佳，多和朋友交流。',lucky:'黄色',luckyNum:3,match:'水瓶座'},week:{love:4,work:4,health:3,money:3,advice:'本周多变中保持专注。',lucky:'蓝色',luckyNum:5,match:'天秤座'},month:{love:5,work:3,health:4,money:4,advice:'本月沟通能力突出。',lucky:'银色',luckyNum:7,match:'射手座'},year:{love:4,work:3,health:3,money:4,advice:'今年要学会在一个领域深耕。',lucky:'黄色',luckyNum:3,match:'白羊座'}},
  cancer:  { today:{love:4,work:4,health:4,money:3,advice:'今天适合和家人在一起，感受温暖。',lucky:'白色',luckyNum:2,match:'天蝎座'},week:{love:4,work:3,health:4,money:4,advice:'本周注意保护自己的情绪。',lucky:'银色',luckyNum:7,match:'双鱼座'},month:{love:5,work:4,health:3,money:4,advice:'本月情感丰富，善用直觉。',lucky:'蓝色',luckyNum:4,match:'处女座'},year:{love:5,work:4,health:4,money:3,advice:'今年关注家庭和内心世界。',lucky:'白色',luckyNum:6,match:'摩羯座'}},
  leo:     { today:{love:4,work:5,health:4,money:3,advice:'今天是展示自我的好日子！',lucky:'金色',luckyNum:1,match:'白羊座'},week:{love:3,work:5,health:4,money:4,advice:'本周领导力突出。',lucky:'橙色',luckyNum:5,match:'天秤座'},month:{love:4,work:4,health:5,money:4,advice:'本月注意保持谦逊。',lucky:'红色',luckyNum:9,match:'水瓶座'},year:{love:4,work:5,health:4,money:4,advice:'今年是闪耀的一年，把握舞台。',lucky:'金色',luckyNum:1,match:'射手座'}},
  virgo:   { today:{love:3,work:5,health:4,money:4,advice:'今天适合整理和规划，做事要细致。',lucky:'米色',luckyNum:6,match:'金牛座'},week:{love:4,work:5,health:3,money:4,advice:'本周注重细节会有好结果。',lucky:'绿色',luckyNum:4,match:'摩羯座'},month:{love:3,work:4,health:4,money:5,advice:'本月适合精打细算。',lucky:'白色',luckyNum:8,match:'巨蟹座'},year:{love:3,work:5,health:4,money:4,advice:'今年追求完美也要接受不完美。',lucky:'米色',luckyNum:2,match:'双鱼座'}},
  libra:   { today:{love:5,work:3,health:4,money:3,advice:'今天人际关系和谐，适合社交。',lucky:'粉色',luckyNum:7,match:'双子座'},week:{love:4,work:4,health:4,money:3,advice:'本周注意做出选择。',lucky:'蓝色',luckyNum:3,match:'水瓶座'},month:{love:5,work:4,health:3,money:4,advice:'本月合作运佳。',lucky:'绿色',luckyNum:6,match:'狮子座'},year:{love:5,work:4,health:4,money:3,advice:'今年要在平衡中找到方向。',lucky:'粉色',luckyNum:9,match:'白羊座'}},
  scorpio: { today:{love:4,work:4,health:3,money:5,advice:'今天直觉敏锐，适合做重要决定。',lucky:'深红色',luckyNum:8,match:'巨蟹座'},week:{love:3,work:5,health:4,money:4,advice:'本周专注力强。',lucky:'黑色',luckyNum:4,match:'双鱼座'},month:{love:4,work:4,health:4,money:5,advice:'本月洞察力超群。',lucky:'紫色',luckyNum:2,match:'处女座'},year:{love:4,work:5,health:3,money:5,advice:'今年是蜕变重生的一年。',lucky:'深红色',luckyNum:7,match:'摩羯座'}},
  sagittarius:{ today:{love:4,work:3,health:5,money:3,advice:'今天适合探索新事物，拓宽视野。',lucky:'紫色',luckyNum:9,match:'狮子座'},week:{love:4,work:4,health:4,money:3,advice:'本周大胆尝试。',lucky:'蓝色',luckyNum:3,match:'白羊座'},month:{love:3,work:4,health:5,money:4,advice:'本月旅行运佳。',lucky:'绿色',luckyNum:7,match:'水瓶座'},year:{love:4,work:4,health:4,money:3,advice:'今年是探索和成长的一年。',lucky:'紫色',luckyNum:5,match:'天秤座'}},
  capricorn:{ today:{love:3,work:5,health:4,money:4,advice:'今天适合务实行动，脚踏实地。',lucky:'棕色',luckyNum:4,match:'金牛座'},week:{love:3,work:5,health:4,money:5,advice:'本周事业运旺。',lucky:'灰色',luckyNum:8,match:'处女座'},month:{love:4,work:4,health:4,money:5,advice:'本月财务规划很重要。',lucky:'绿色',luckyNum:1,match:'天蝎座'},year:{love:3,work:5,health:4,money:5,advice:'今年稳扎稳打必有所成。',lucky:'棕色',luckyNum:6,match:'双鱼座'}},
  aquarius:{ today:{love:3,work:4,health:4,money:3,advice:'今天创意灵感迸发，大胆表达。',lucky:'蓝色',luckyNum:11,match:'天秤座'},week:{love:4,work:3,health:4,money:4,advice:'本周与众不同。',lucky:'银色',luckyNum:7,match:'双子座'},month:{love:3,work:5,health:3,money:4,advice:'本月创新运强。',lucky:'紫色',luckyNum:3,match:'射手座'},year:{love:4,work:4,health:4,money:3,advice:'今年打破常规会有收获。',lucky:'蓝色',luckyNum:9,match:'狮子座'}},
  pisces:  { today:{love:5,work:3,health:3,money:3,advice:'今天感受力强，适合艺术创作。',lucky:'海蓝色',luckyNum:12,match:'巨蟹座'},week:{love:5,work:3,health:4,money:3,advice:'本周跟随直觉。',lucky:'紫色',luckyNum:7,match:'天蝎座'},month:{love:4,work:4,health:3,money:4,advice:'本月灵感丰富。',lucky:'银色',luckyNum:2,match:'处女座'},year:{love:5,work:3,health:3,money:3,advice:'今年梦想照进现实。',lucky:'海蓝色',luckyNum:6,match:'摩羯座'}},
}

/** 构建统一格式的运势返回对象 */
function makeResult(zodiac, d, timeLabel, isFallback) {
  return {
    code: 200,
    type: zodiac,
    title: zodiac + '运势',
    time: timeLabel,
    fortune: {
      all: Math.round((d.love + d.work + d.health + d.money) / 4 * 20 * 10) / 10 / 20,
      work: d.work, love: d.love, health: d.health, money: d.money,
    },
    shortcomment: (d.advice || '').substring(0, 20),
    luckynumber: String(d.luckyNum || 7),
    luckycolor: d.lucky || '未知',
    luckyconstellation: d.match || '暂无',
    todo: { yi: '宜：一切顺利', ji: '忌：钻牛角尖' },
    fortunetext: {
      all: d.advice || '今天的综合运势不错。',
      work: '工作方面按部就班即可。',
      love: '感情方面顺其自然。',
      health: '注意休息，保持良好作息。',
      money: '财务方面量入为出。',
    },
    fallback: isFallback,
  }
}

/** 从 xxapi.cn v2 获取运势（主数据源）
 * v2文档：https://xxapi.cn/doc/horoscope
 * 参数：type=星座英文(aries), time=today/week/month/year
 */
function fetchFromXxapiV2(zodiac, time) {
  const https = require('https')
  const en = ZODIAC_EN[zodiac]
  if (!en) return Promise.resolve(null)
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'v2.xxapi.cn',
      path: '/api/horoscope?type=' + en + '&time=' + time,
      method: 'GET',
      timeout: 10000
    }, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          // v2返回 { code: 200, msg: '...', data: {...} }
          if (json && json.code === 200 && json.data) resolve(json.data)
          else resolve(null)
        } catch(e) { resolve(null) }
      })
    })
    req.on('error', () => resolve(null))
    req.on('timeout', () => { req.destroy(); resolve(null) })
    req.end()
  })
}

/**
 * Netlify 函数入口
 * GET /.netlify/functions/horoscope?zodiac=白羊座&time=today
 */
exports.handler = async function(event, context) {
  // 允许跨域（小程序需要）
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8'
  }

  // 处理 OPTIONS 预检请求
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers }
  }

  try {
    const q = event.queryStringParameters || {}
    const zodiac = q.zodiac
    const time = q.time || 'today'

    if (!zodiac) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ code: 400, error: '请提供星座参数，如 ?zodiac=白羊座' })
      }
    }

    const timeLabel = time === 'today' ? '今日' : time === 'week' ? '本周' : time === 'month' ? '本月' : '本年'

    // 优先从 xxapi v2 在线接口获取（文档：https://xxapi.cn/doc/horoscope）
    const apiData = await fetchFromXxapiV2(zodiac, time)
    if (apiData) {
      // v2返回结构：{ fortune:{all,love,money,work,health}百分制, fortunetext, index, luckycolor, luckyconstellation, luckynumber, shortcomment, time, title, todo }
      const fortune = apiData.fortune || {}
      const ftext = apiData.fortunetext || {}
      // 百分制(1-100)转1-5分制
      const to5 = (v) => Math.max(1, Math.min(5, Math.round((v || 50) / 100 * 10) / 2))
      const d = {
        love: to5(fortune.love),
        work: to5(fortune.work || fortune.career),
        health: to5(fortune.health),
        money: to5(fortune.money),
        advice: ftext.all || apiData.shortcomment || '',
        lucky: apiData.luckycolor || '未知',
        luckyNum: apiData.luckynumber || 7,
        match: apiData.luckyconstellation || '暂无'
      }
      const result = makeResult(zodiac, d, timeLabel, false)
      // v2详细文本覆盖
      if (ftext.all) result.fortunetext.all = ftext.all
      if (ftext.work || ftext.career) result.fortunetext.work = ftext.work || ftext.career
      if (ftext.love) result.fortunetext.love = ftext.love
      if (ftext.health) result.fortunetext.health = ftext.health
      if (ftext.money) result.fortunetext.money = ftext.money
      if (apiData.todo && apiData.todo.yi) result.todo.yi = '宜：' + apiData.todo.yi
      if (apiData.todo && apiData.todo.ji) result.todo.ji = '忌：' + apiData.todo.ji
      return { statusCode: 200, headers, body: JSON.stringify(result) }
    }

    // 在线接口不可用时，回退到本地预设数据
    const en = ZODIAC_EN[zodiac]
    if (!en) {
      return { statusCode: 400, headers, body: JSON.stringify({ code: 400, error: '未知星座，请检查输入' }) }
    }
    const fb = (fallbackData[en] || fallbackData['aries'])[time]
    if (!fb) {
      return { statusCode: 500, headers, body: JSON.stringify({ code: 500, error: '暂无数据' }) }
    }

    const result = makeResult(zodiac, fb, timeLabel, true)
    return { statusCode: 200, headers, body: JSON.stringify(result) }
  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ code: 500, error: e.message })
    }
  }
}
