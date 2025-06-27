import { getHexagramNumberByBinary, getBinaryByHexagramNumber } from './binaryToHexagramMap'

export interface HexagramYao {
  line: string // 爻名，如"初九"
  text: string // 爻辞
  xiang: string // 象传
}

export interface HexagramData {
  id: string // 卦序号
  name: string // 卦名
  alias: string // 别名
  description: string // 卦辞
  tuan: string // 彖传
  xiang: string // 象传
  yaos: HexagramYao[] // 六爻
  lines_interpretation: { [key: string]: string } // 爻词解释，兼容现有格式
  use_nine?: string // 用九
  use_six?: string // 用六
}

// 解析六十四卦.md文件内容
export function parseHexagramsFromMd(content: string): HexagramData[] {
  try {
    
    const hexagrams: HexagramData[] = []
    
    // 按卦象分割内容
    const hexagramSections = content.split(/\n(?=\d{2}\s)/)
    
    for (const section of hexagramSections) {
      if (!section.trim()) continue
      
      const lines = section.split('\n')
      const firstLine = lines[0]
      
      // 解析卦象基本信息
      const match = firstLine.match(/(\d{2})\s+(.+?)\s+(.+?)\s+(.+)/)
      if (!match) continue
      
      const [, numberStr, name, alias, structure] = match
      const number = parseInt(numberStr)
      
      // 解析卦辞
      const guaCiMatch = lines[1]?.match(/^(.+?)：(.+)$/)
      const description = guaCiMatch ? guaCiMatch[2] : ''
      
      // 解析彖传和象传
      let tuan = ''
      let xiang = ''
      
      for (let i = 2; i < lines.length; i++) {
        const line = lines[i]
        if (line.includes('《彖》曰：')) {
          tuan = line.replace('《彖》曰：', '')
        } else if (line.includes('《象》曰：')) {
          xiang = line.replace('《象》曰：', '')
          break
        }
      }
      
      // 解析爻辞
      const yaos: HexagramYao[] = []
      const linesInterpretation: { [key: string]: string } = {}
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        // 匹配爻辞格式：初九：xxx《象》曰：xxx 或 六二：xxx《象》日：xxx
        // 修复：使用更灵活的分隔符匹配，支持制表符、空格或直接连接
        const yaoMatch = line.match(/^(初[九六]|[九六][二三四五]|上[九六])：(.+?)\s*《象》[曰日]：(.+)$/)
        if (yaoMatch) {
          const [, yaoName, text, xiangText] = yaoMatch
          yaos.push({
            line: yaoName,
            text: text.trim(),
            xiang: xiangText.trim()
          })
          linesInterpretation[yaoName] = text.trim()
        }
      }
      
      // 生成二进制表示
       const binary = getBinaryByHexagramNumber(number)
       const interpretation = `${description}\n\n彖传：${tuan}\n\n象传：${xiang}`
       
       hexagrams.push({
         id: number.toString(),
         name,
         alias,
         description,
         tuan,
         xiang,
         interpretation,
         yaos,
         lines_interpretation: linesInterpretation,
         binary
       })
    }
    
    return hexagrams
  } catch (error) {
    console.error('Error parsing hexagrams:', error)
    return []
  }
}

// 缓存解析结果
let cachedHexagrams: HexagramData[] | null = null

// 异步获取卦象数据
export async function getHexagramsData(): Promise<HexagramData[]> {
  if (!cachedHexagrams) {
    try {
      // 在客户端环境中，从public目录获取文件
      const response = await fetch('/六十四卦.md')
      const content = await response.text()
      cachedHexagrams = parseHexagramsFromMd(content)
    } catch (error) {
      console.error('Failed to load hexagram data:', error)
      cachedHexagrams = []
    }
  }
  return cachedHexagrams
}

// 同步版本，用于已缓存的数据
export function getHexagramsDataSync(): HexagramData[] {
  return cachedHexagrams || []
}

export function getHexagramById(id: string): HexagramData | undefined {
  const hexagrams = getHexagramsDataSync()
  return hexagrams.find(h => h.id === id.padStart(2, '0'))
}

export function getHexagramByName(name: string): HexagramData | undefined {
  const hexagrams = getHexagramsDataSync()
  return hexagrams.find(h => h.name === name || h.alias === name)
}

// 根据lines数组获取对应的卦象数据
export function getHexagramDataByLines(lines: number[]): HexagramData | undefined {
  // 将lines数组转换为二进制字符串
  const binary = lines.map(line => line.toString()).join('')
  const hexagramNumber = getHexagramNumberByBinary(binary)
  return getHexagramById(hexagramNumber.toString())
}