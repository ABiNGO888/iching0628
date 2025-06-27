// 该模块用于将六十四卦.md结构化为可查询的JSON数据，并提供查询接口
import fs from "fs"
import path from "path"

// 预处理：将六十四卦.md内容结构化为JSON（这里只做部分示例，实际应全量处理）
// 为避免运行时读取，建议后续用脚本预处理为json文件
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
}

// 这里只做部分示例，实际应全量自动生成
export const hexagramDict: HexagramData[] = [
  {
    id: "01",
    name: "乾卦",
    alias: "乾为天",
    description: "乾：元，亨，利，贞。",
    tuan: "《彖》曰：大哉乾元，万物资始，乃统天。云行雨施，品物流形。大明始终，六位时成，时乘六龙以御天。乾道变化，各正性命，保合大和，乃利贞。首出庶物，万国咸宁。",
    xiang: "《象》曰：天行健，君子以自强不息。",
    yaos: [
      { line: "初九", text: "潜龙勿用。", xiang: "《象》曰：潜龙勿用，阳在下也。" },
      { line: "九二", text: "见龙在田，利见大人。", xiang: "《象》曰：见龙在田，德施普也。" },
      { line: "九三", text: "君子终日乾乾，夕惕若厉，无咎。", xiang: "《象》曰：终日乾乾，反复道也。" },
      { line: "九四", text: "或跃在渊，无咎。", xiang: "《象》曰：或跃在渊，进无咎也。" },
      { line: "九五", text: "飞龙在天，利见大人。", xiang: "《象》曰：飞龙在天，大人造也。" },
      { line: "上九", text: "亢龙有悔。", xiang: "《象》曰：亢龙有悔，盈不可久也。" }
    ]
  },
  {
    id: "02",
    name: "坤卦",
    alias: "坤为地",
    description: "坤：元亨，利牝马之贞。君子有攸往，先迷后得主。利西南得朋，东北丧朋。安贞吉。",
    tuan: "《彖》曰：至哉坤元，万物资生，乃顺承天。坤厚载物，德合无疆。含弘光大，品物咸亨。牝马地类，行地无疆，柔顺利贞。君子攸行，先迷失道，后顺得常。西南得朋，乃与类行；东北丧朋，乃终有庆。安贞之吉，应地无疆。",
    xiang: "《象》曰：地势坤，君子以厚德载物。",
    yaos: [
      { line: "初六", text: "履霜，坚冰至。", xiang: "《象》曰：履霜坚冰，阴始凝也。驯致其道，至坚冰也。" },
      { line: "六二", text: "直方大，不习，无不利。", xiang: "《象》曰：六二之动，直以方也。不习，无不利，地道光也。" },
      { line: "六三", text: "含章可贞。或从王事，无成有终。", xiang: "《象》曰：含章可贞；以时发也。或从王事，知光大也。" },
      { line: "六四", text: "括囊，无咎无誉。", xiang: "《象》曰：括囊无咎，慎不害也。" },
      { line: "六五", text: "黄裳，元吉。", xiang: "《象》曰：黄裳元吉，文在中也。" },
      { line: "上六", text: "龙战于野，其血玄黄。", xiang: "《象》曰：龙战于野，其道穷也。" }
    ]
  },
  {
    id: "18",
    name: "蛊卦",
    alias: "山风蛊",
    description: "元亨，利涉大川。先甲三日，后甲三日。",
    tuan: "《彖》曰：蛊，刚上而柔下，巽而止，蛊。蛊，元亨，而天下治也。利涉大川，往有事也。先甲三日，后甲三日，终则有始，天行也。",
    xiang: "《象》曰：山下有风，蛊。君子以振民育德。",
    yaos: [
      { line: "初六", text: "干父之蛊，有子，考无咎，厉终吉。", xiang: "《象》曰：干父之蛊，意承考也。" },
      { line: "九二", text: "干母之蛊，不可贞。", xiang: "《象》曰：干母之蛊，得中道也。" },
      { line: "九三", text: "干父之蛊，小有晦，无大咎。", xiang: "《象》曰：干父之蛊，终无咎也。" },
      { line: "六四", text: "裕父之蛊，往见吝。", xiang: "《象》曰：裕父之蛊，往未得也。" },
      { line: "六五", text: "干父之蛊，用誉。", xiang: "《象》曰：干父用誉，承以德也。" },
      { line: "上九", text: "不事王侯，高尚其事。", xiang: "《象》曰：不事王侯，志可则也。" }
    ]
  },
  {
    id: "07",
    name: "师卦",
    alias: "地水师",
    description: "师：贞，丈人吉，无咎。",
    tuan: "《彖》曰：师，众也，贞正也，能以众正，可以王矣。刚中而应，行险而顺，以此毒天下，而民从之，吉又何咎矣？",
    xiang: "《象》曰：地中有水，师，君子以容民蓄众。",
    yaos: [
      { line: "初六", text: "师出以律，否臧凶。", xiang: "《象》曰：师出以律，失律凶也。" },
      { line: "九二", text: "在师，中吉，无咎，王三锡命。", xiang: "《象》曰：在师中吉，承天宠也。王三锡命，怀万邦也。" },
      { line: "六三", text: "师或舆尸，凶。", xiang: "《象》曰：师或舆尸，大无功也。" },
      { line: "六四", text: "师左次，无咎。", xiang: "《象》曰：左次无咎，未失常也。" },
      { line: "六五", text: "田有禽，利执；言，无咎。长子帅师，弟子舆尸，贞凶。", xiang: "《象》曰：长子帅师，以中行也。弟子舆师，使不当也。" },
      { line: "上六", text: "大君有命，开国承家，小人勿用。", xiang: "《象》曰：大君有命，以正功也。小人勿用，必乱邦也。" }
    ]
  },
  {
    id: "61",
    name: "中孚卦",
    alias: "风泽中孚",
    description: "中孚：豚鱼，吉，利涉大川，利贞。",
    tuan: "《彖》曰：中孚，柔在内而刚得中。说而巽，孚乃化邦也。豚鱼吉，信及豚鱼也。利涉大川，乘木舟虚也。中孚以利贞，乃应乎天也。",
    xiang: "《象》曰：泽上有风，中孚。君子以议狱缓死。",
    yaos: [
      { line: "初九", text: "虞吉，有它不燕。", xiang: "《象》曰：初九虞吉，志未变也。" },
      { line: "九二", text: "鸣鹤在阴，其子和之。我有好爵，吾与尔靡之。", xiang: "《象》曰：其子和之，中心愿也。" },
      { line: "六三", text: "得敌，或鼓或罢，或泣或歌。", xiang: "《象》曰：可鼓或罢，位不当也。" },
      { line: "六四", text: "月几望，马匹亡，无咎。", xiang: "《象》曰：马匹亡，绝类上也。" },
      { line: "九五", text: "有孚挛如，无咎。", xiang: "《象》曰：有孚挛如，位正当也。" },
      { line: "上九", text: "翰音登于天，贞凶。", xiang: "《象》曰：翰音登于天，何可长也。" }
    ]
  }
  // ... 其余六十一卦数据请用脚本自动生成或手动补全
]

// 查询接口
export function getHexagramById(id: string): HexagramData | undefined {
  return hexagramDict.find(h => h.id === id)
}

export function getHexagramByName(name: string): HexagramData | undefined {
  return hexagramDict.find(h => h.name === name || h.alias === name)
}