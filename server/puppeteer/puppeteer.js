const puppeteer = require('puppeteer')

const url = "http://www.ituring.com.cn/book?tab=book&sort=hot&page="

  ; (async () => {
    console.log('Start visit the book page')

    const browser = await puppeteer.launch({   //创建一个浏览器
      args: ['-no-sandbox']    //启动一个非杀伤模式
    })

    const page = await browser.newPage()       //新建一个页面

    let result = []

    for(let i=0; i<2; i++){
      let newUrl = url + i

      console.log('现在爬取到了第' + i + '个页面')

      await page.goto(newUrl, {
        waitUntil: 'networkidle2' //在网络空闲的时候进行
      })

      result = result.concat(await page.evaluate(() => {
        let $ = window.$
        let items = $('.block-books ul li')
        let books = []
  
        if (items.length >= 1) {
          items.each((index, item) => {
            let it = $(item)
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

    browser.close()

    console.log(result.length)
  })()