## 通过使用puppeteer和asyce控制并发爬取图书社区信息

> [puppeteer](https://github.com/GoogleChrome/puppeteer)是一个GoogleChrome开源的一个node库,他提供了一组用来操纵Chrome的API(默认是无headless)，我们可以使用它进行信息的爬取

### 现在先简单的实现一下爬取
1.npm i puppeteer，先加载puppeteer库，这里使用的node库只有puppeteer哦~
2.获取我们要爬取的网站地址，和分析网站信息的逻辑（我这里爬取的url是：图灵社区的图书页“http://www.ituring.com.cn/book?tab=book&sort=hot&page=”，要爬取图灵的所有图书信息很简单，只要在url后面加数字就是对应的页码）
3.接下来将使用async来进行控制并发爬取数据

#### 简单的定义一下所有使用的对象
```
const puppeteer = require('puppeteer')
const url = "http://www.ituring.com.cn/book?tab=book&sort=hot&page="
```

#### 异步获取信息
```
; (async () => {                               //(async() => {})() 是一个立即执行函数
    console.log('Start visit the book page')   

    const browser = await puppeteer.launch({   //创建一个浏览器brower
      args: ['-no-sandbox']    //启动一个非杀伤模式
    })

    const page = await browser.newPage()       //新建一个页面page

    let result = []

    for(let i=0; i<56; i++){                   //图灵社区的书籍总共有56页，每页是20条数据，这里可以相应的增加i的大小
      let newUrl = url + i

      console.log('现在爬取到了第' + i + '个页面')

      await page.goto(newUrl, {              
        waitUntil: 'networkidle2'             //在网络空闲的时候进行
      })

      result = result.concat(await page.evaluate(() => {    //数据一页一页的concat起来，concat()是数组合并的方法
        let $ = window.$                     //因为图灵社区有引用jq，这里的话我们就是用jq进行dom操作
        let items = $('.block-books ul li')
        let books = []
  
        if (items.length >= 1) {
          items.each((index, item) => {
            let it = $(item)                //获取图书的序号、图片地址、名称、作者和译者
            let id = it.find('.book-img a').attr('href').split('book/')[1]
            let imgUrl = it.find('.book-img img').attr('src')
            let name = it.find('.name').text()
            let author = $.trim(it.find('.author span').eq(0).text())
            let translators = $.trim(it.find('.author span').eq(1).text())
  
            books.push({
              b_id: id,
              b_name: name,
              b_imgUrl: imgUrl,
              b_author: author,
              b_translators: translators
            })
          })
        }
  
        return books
      }))

    }

    browser.close()                                     //关闭浏览器

    console.log(result)
  })()
```
