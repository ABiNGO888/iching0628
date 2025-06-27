"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DivinationInstructionModalProps {
  onClose?: () => void
}

export function DivinationInstructionModal({ onClose }: DivinationInstructionModalProps) {
  const [open, setOpen] = useState(true)

  // 处理关闭事件
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen && onClose) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col items-center justify-center">
        <DialogHeader className="w-full flex flex-col items-center justify-center">
          <DialogTitle className="text-center text-xl font-bold w-full">占卦前须知</DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground w-full">
            请在占卦前仔细阅读以下内容
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="prayer" className="w-full flex flex-col items-center justify-center">
          <TabsList className="grid grid-cols-4 mb-4 w-full place-items-center">
            <TabsTrigger value="prayer" className="text-center">祝词</TabsTrigger>
            <TabsTrigger value="principles" className="text-center">三不占</TabsTrigger>
            <TabsTrigger value="method" className="text-center">提问方法</TabsTrigger>
            <TabsTrigger value="about" className="text-center">关于易经</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] rounded-md border p-4 flex flex-col items-center justify-center">
            <TabsContent value="prayer" className="space-y-4 flex flex-col items-center justify-center text-center">
              <div className="w-full flex flex-col items-center justify-center">
                <h3 className="text-lg font-semibold mb-2 text-center w-full">占卦前默念祝词</h3>
                <div className="space-y-4 w-full flex flex-col items-center justify-center">
                  <div className="w-full flex flex-col items-center justify-center">
                    <h4 className="font-medium text-center w-full">标准版:</h4>
                    <p className="text-sm bg-amber-50 p-3 rounded-md border border-amber-200 text-center w-full">
                      "假尔泰筮有常，弟子XXX今以某事（想要占问之事），未知可否。 爰质所疑于神之灵，吉凶、得失、悔吝、忧虞，惟尔有神，尚明告知。"
                    </p>
                    <h4 className="font-medium mt-3 text-center w-full">现代版:</h4>
                    <p className="text-sm bg-amber-50 p-3 rounded-md border border-amber-200 text-center w-full">
                      伏羲文王在上、满天诸神佛菩萨、诸星君罗汉在上；弟子XXX，生于19XX年X月X日X时，居于XX市XX区县XX路XX号XX栋XXX室。现求问：什么什么事的吉凶，请卦神赐卦！
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground italic text-center w-full">
                    只要能让自己的意念更集中，可自行选择。
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="principles" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">占前需知</h3>
                <p className="text-sm mb-3">
                  在理性及经验皆无法明确论断时，可以进行占卦。首先，要遵守"三不占"原则：
                </p>
                
                <ul className="space-y-2 list-disc pl-5">
                  <li className="text-sm">
                    <span className="font-medium">不诚不占：</span>此乃求教于神明，首重真诚。
                  </li>
                  <li className="text-sm">
                    <span className="font-medium">不义不占：</span>不合乎正当性及合理性的问题，不必占问。
                  </li>
                  <li className="text-sm">
                    <span className="font-medium">不疑不占：</span>必须是理性难以测度之事。
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="method" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">提问方法</h3>
                
                <ul className="space-y-3 list-disc pl-5">
                  <li className="text-sm">
                    每次一个问题，问题是：现在有一选择，一旦决定则后果如何？譬如小孩可选两个学校，则须分占二次，看其结果何者为宜。或者，欲购某屋，占其是否可行？当然，亦可占个人之时运、经商、婚姻、事业、健康、子嗣等。
                  </li>
                  <li className="text-sm">
                    同一问题，可以用不同的方式来占(本软件提供最简易的两种方式)。一旦有了结果，则须过三个月（一季）再占，或更换节气再占，同一事不可连续二占，第一占即是因缘巧合产生的结果，不疑有他。
                  </li>
                </ul>
                
                <div className="mt-4 p-3 bg-amber-50 rounded-md border border-amber-200">
                  <p className="text-sm font-medium">占卦时间建议</p>
                  <p className="text-sm">
                    占卦最好在清晨，心思清净，意念集中，午夜11点后属于子时交界，不宜占卜。
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="about" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">如何查看易经</h3>
                <div className="space-y-3 text-sm">
                  <p>
                    人生有无数的抉择，《易经》造成吉凶悔吝。如何抉择可保平安？可以趋吉避凶？《易经》提醒人要注意：德行（因为欲望会造成盲点与执著）；能力（有能力就有自信）；以及智慧（充分运用理性的力量，加上生活经验的配合）。
                  </p>
                  
                  <p>
                    在"智慧"方面，占卦可以提供协助。所谓的"无有师保，如临父母"，以及"人谋鬼谋，百姓与能"（系辞下）。
                  </p>
                  
                  <p>
                    占卜并非完全准确，正所谓占卦容易解卦难，有时需要时间来应验，有时是卦象并非爻词，诸多原因需要您亲自体悟，但确实可以提供您思考事情的一个新的角度，像是一位良师益友，正是这位当年孔夫子53岁时理解易经后，赞道"无有师保，如临父母"的感受，并为之著疏"十翼"。
                  </p>
                  
                  <p>
                    易经是自周公开始陆续集众人智慧集大成的著作，不但饱藏人生智慧更可以在生活中实用，希望您也能认识这位中国人的老朋友，并让它生活在能帮助到您。
                  </p>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}