// 从六十四卦.md文件中提取爻辞的工具函数

interface YaoText {
  name: string;
  text: string;
  xiang: string;
}

interface HexagramText {
  id: number;
  name: string;
  yaos: YaoText[];
}

// 爻位名称映射
const YAO_NAMES: { [key: string]: string } = {
  '0_yin': '初六',
  '0_yang': '初九',
  '1_yin': '六二', 
  '1_yang': '九二',
  '2_yin': '六三',
  '2_yang': '九三',
  '3_yin': '六四',
  '3_yang': '九四',
  '4_yin': '六五',
  '4_yang': '九五',
  '5_yin': '上六',
  '5_yang': '上九'
};

/**
 * 从六十四卦.md文件中提取指定卦的爻辞
 * @param hexagramId 卦的ID (1-64)
 * @param yaoIndex 爻的位置 (0-5，从下到上)
 * @param isYang 是否为阳爻
 * @returns 爻辞文本，如果未找到则返回null
 */
export async function extractYaoTextFromFile(
  hexagramId: number,
  yaoIndex: number,
  isYang: boolean
): Promise<string | null> {
  try {
    // 读取六十四卦.md文件
    const response = await fetch('/六十四卦.md');
    if (!response.ok) {
      console.error('Failed to fetch 六十四卦.md');
      return null;
    }
    
    const content = await response.text();
    const lines = content.split('\n');
    
    // 查找对应卦的开始位置（格式如：01 乾卦）
    const hexagramPattern = new RegExp(`^${hexagramId.toString().padStart(2, '0')}\\s`);
    let hexagramStartIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (hexagramPattern.test(lines[i])) {
        hexagramStartIndex = i;
        break;
      }
    }
    
    if (hexagramStartIndex === -1) {
      console.error(`Hexagram ${hexagramId} not found in 六十四卦.md`);
      return null;
    }
    
    // 确定爻名
    const yaoKey = `${yaoIndex}_${isYang ? 'yang' : 'yin'}`;
    const yaoName = YAO_NAMES[yaoKey];
    
    // 在卦的范围内查找对应的爻辞
    let nextHexagramIndex = lines.length;
    for (let i = hexagramStartIndex + 1; i < lines.length; i++) {
      if (/^\d{2}\s/.test(lines[i])) {
        nextHexagramIndex = i;
        break;
      }
    }
    
    // 在当前卦的范围内查找爻辞（注意：文件中有些地方是"曰"，有些地方是"日"）
    // 使用\t匹配制表符，因为文件中爻词和《象》之间是制表符分隔的
    const yaoPattern = new RegExp(`${yaoName}：(.+?)\\t《象》[曰日]：(.+)`);
    
    for (let i = hexagramStartIndex; i < nextHexagramIndex; i++) {
      const match = lines[i].match(yaoPattern);
      if (match) {
        const yaoText = match[1];
        const xiangText = match[2];
        return `${yaoName}：${yaoText}\n《象》曰：${xiangText}`;
      }
    }
    
    console.error(`Yao text for ${yaoName} in hexagram ${hexagramId} not found`);
    return null;
    
  } catch (error) {
    console.error('Error extracting yao text:', error);
    return null;
  }
}

/**
 * 根据爻的索引和阴阳属性获取爻名
 * @param index 爻的位置 (0-5)
 * @param isYang 是否为阳爻
 * @returns 爻名
 */
export function getYaoName(index: number, isYang: boolean): string {
  const yaoKey = `${index}_${isYang ? 'yang' : 'yin'}`;
  return YAO_NAMES[yaoKey];
}