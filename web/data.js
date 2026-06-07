// 数据维护约束：
// 1. `/docs/训练与饮食计划.md` 是训练与饮食计划的主来源。
// 2. 本文件仅作为网页展示 / 打卡使用的数据镜像。
// 3. 如需调整计划内容，请先更新文档，再同步此文件，避免两处数据漂移。
export const GYM_DATA = {
    profile: {
        age: 22,
        gender: "男",
        height: "178cm",
        weight: "81.2kg",
        bodyFat: "23.3%",
        targetBodyFat: "15%",
        bmi: 25.9,
        muscleMass: "59.0kg",
        bmr: "1716 kcal",
        targetWeight: "73–74kg",
        type: "泡芙型偏胖"
    },
    weeklyOverview: [
        { day: "周一", morning: "下肢力量（股四头主导）", evening: "休息", focus: "大重量复合" },
        { day: "周二", morning: "上肢推（胸/肩/三头）", evening: "稳态有氧 30min（跑步机）", focus: "推链+脂肪氧化" },
        { day: "周三", morning: "下肢力量（后链/臀）", evening: "休息", focus: "后链激活" },
        { day: "周四", morning: "上肢拉（背/二头）", evening: "稳态有氧 30min（爬楼机）", focus: "拉链+下肢耐力" },
        { day: "周五", morning: "全身复合 + 核心", evening: "HIIT 15min (19:00 开始)", focus: "代谢冲击" },
        { day: "周六", morning: "中等强度有氧 40–50min", evening: "休息", focus: "长时脂肪供能" },
        { day: "周日", morning: "休息（散步/拉伸）", evening: "休息", focus: "恢复" }
    ],
    dailyRoutines: {
        "1": { // 周一
            dayName: "周一",
            workoutType: "下肢力量（股四头主导）",
            warmup: "动感单车 5min + 髋关节激活（蚌式开合×15、臀桥×15、徒手深蹲×15）",
            workouts: [
                { id: "w1_1", name: "杠铃高杠深蹲", sets: "4×6–8", remark: "主项，RPE 8，组间 120s" },
                { id: "w1_2", name: "哑铃保加利亚分腿蹲", sets: "3×10/腿", remark: "单边稳定，组间 90s" },
                { id: "w1_3", name: "腿举（脚掌靠下）", sets: "3×10–12", remark: "股四头强化" },
                { id: "w1_4", name: "坐姿腿屈伸", sets: "3×12–15", remark: "末端收缩 2 秒" },
                { id: "w1_5", name: "站姿提踵", sets: "3×15", remark: "小腿" },
                { id: "w1_6", name: "平板支撑", sets: "3×45s", remark: "核心收尾" }
            ],
            meals: [
                { id: "m1_1", time: "7:00", title: "晨起", desc: "黑咖啡 200ml + 甜菜根粉 3–6g 冲水" },
                { id: "m1_2", time: "7:20", title: "训练前小餐", desc: "香蕉 1 根 + 乳清蛋白粉 12g 兑水 (约180kcal)" },
                { id: "m1_3", time: "8:00-10:00", title: "早训", desc: "下肢力量训练" },
                { id: "m1_4", time: "10:15", title: "训练后早餐", desc: "燕麦片40g + 牛奶250ml + 蓝莓50g; 全蛋2个+蛋白2个; 鸡胸80g/牛肉60g; 肌酸5g (约550kcal)" },
                { id: "m1_5", time: "12:00", title: "食堂午餐", desc: "主食1拳量(约150g) + 蛋白1掌量(约120g) + 绿叶菜2份 (约600kcal)" },
                { id: "m1_6", time: "15:30", title: "加餐", desc: "无糖希腊酸奶150g + 原味坚果15g (约220kcal)" },
                { id: "m1_7", time: "18:00", title: "食堂晚餐", desc: "主食1拳量(120g) + 蛋白1掌量(110g) + 绿叶菜2份 (约480kcal)" },
                { id: "m1_8", time: "22:30", title: "睡前(可选)", desc: "甘氨酸镁 200–400mg" }
            ]
        },
        "2": { // 周二
            dayName: "周二",
            workoutType: "上肢推（胸/肩/三头）+ 晚有氧",
            warmup: "椭圆机 4min + 肩袖激活（弹力带外旋×15、YTW×10）",
            workouts: [
                { id: "w2_1", name: "杠铃卧推", sets: "4×6–8", remark: "主项，RPE 8" },
                { id: "w2_2", name: "上斜哑铃卧推（30°）", sets: "3×8–10", remark: "上胸" },
                { id: "w2_3", name: "坐姿哑铃推举", sets: "3×8–10", remark: "三角肌前束" },
                { id: "w2_4", name: "哑铃侧平举", sets: "3×12–15", remark: "三角肌中束，轻重量严格" },
                { id: "w2_5", name: "绳索三头下压", sets: "3×12", remark: "三头外侧头" },
                { id: "w2_6", name: "仰卧臂屈伸（哑铃）", sets: "3×10–12", remark: "三头长头" },
                { id: "w2_7", name: "【晚训】稳态有氧(跑步机)", sets: "30min", remark: "22min慢跑心率125-135" }
            ],
            meals: [
                { id: "m2_1", time: "7:00", title: "晨起", desc: "黑咖啡 200ml + 甜菜根粉 3–6g 冲水" },
                { id: "m2_2", time: "7:20", title: "训练前小餐", desc: "香蕉 1 根 + 乳清蛋白粉 12g 兑水 (约180kcal)" },
                { id: "m2_3", time: "8:00-10:00", title: "早训", desc: "上肢推训练" },
                { id: "m2_4", time: "10:15", title: "训练后早餐", desc: "燕麦片40g + 牛奶250ml + 蓝莓50g; 全蛋2个+蛋白2个; 鸡胸80g/牛肉60g; 肌酸5g (约550kcal)" },
                { id: "m2_5", time: "12:00", title: "食堂午餐", desc: "主食1拳量(约150g) + 蛋白1掌量(约120g) + 绿叶菜2份 (约600kcal)" },
                { id: "m2_6", time: "15:30", title: "加餐", desc: "无糖希腊酸奶150g + 原味坚果15g (约220kcal)" },
                { id: "m2_7", time: "18:00", title: "食堂晚餐", desc: "主食1拳量(120g) + 蛋白1掌量(110g) + 绿叶菜2份 (约480kcal)" },
                { id: "m2_8", time: "21:00-21:30", title: "晚训", desc: "稳态有氧 30min" },
                { id: "m2_9", time: "22:00", title: "训练后恢复", desc: "乳清蛋白粉 25g + 牛奶 200ml (约220kcal)" },
                { id: "m2_10", time: "22:30", title: "睡前(可选)", desc: "甘氨酸镁 200–400mg" }
            ]
        },
        "3": { // 周三
            dayName: "周三",
            workoutType: "下肢力量（后链/臀）",
            warmup: "划船机 5min + 臀肌激活（弹力带侧步×15/侧、单腿臀桥×12/腿）",
            workouts: [
                { id: "w3_1", name: "罗马尼亚硬拉", sets: "4×8–10", remark: "主项，感受腘绳收缩" },
                { id: "w3_2", name: "臀冲（杠铃/史密斯）", sets: "4×10–12", remark: "顶峰收缩 1–2 秒" },
                { id: "w3_3", name: "反向腿弯举（俯卧）", sets: "3×10–12", remark: "腘绳孤立" },
                { id: "w3_4", name: "髋外展机", sets: "3×15", remark: "臀中肌" },
                { id: "w3_5", name: "山羊挺身（背伸展）", sets: "3×12–15", remark: "下背+臀" },
                { id: "w3_6", name: "死虫式", sets: "3×10/侧", remark: "核心抗伸展" }
            ],
            meals: [
                { id: "m3_1", time: "7:00", title: "晨起", desc: "黑咖啡 200ml + 甜菜根粉 3–6g 冲水" },
                { id: "m3_2", time: "7:20", title: "训练前小餐", desc: "香蕉 1 根 + 乳清蛋白粉 12g 兑水 (约180kcal)" },
                { id: "m3_3", time: "8:00-10:00", title: "早训", desc: "下肢后链训练" },
                { id: "m3_4", time: "10:15", title: "训练后早餐", desc: "燕麦片40g + 牛奶250ml + 蓝莓50g; 全蛋2个+蛋白2个; 鸡胸80g/牛肉60g; 肌酸5g (约550kcal)" },
                { id: "m3_5", time: "12:00", title: "食堂午餐", desc: "主食1拳量(约150g) + 蛋白1掌量(约120g) + 绿叶菜2份 (约600kcal)" },
                { id: "m3_6", time: "15:30", title: "加餐", desc: "无糖希腊酸奶150g + 原味坚果15g (约220kcal)" },
                { id: "m3_7", time: "18:00", title: "食堂晚餐", desc: "主食1拳量(120g) + 蛋白1掌量(110g) + 绿叶菜2份 (约480kcal)" },
                { id: "m3_8", time: "22:30", title: "睡前(可选)", desc: "甘氨酸镁 200–400mg" }
            ]
        },
        "4": { // 周四
            dayName: "周四",
            workoutType: "上肢拉（背/二头）+ 晚有氧",
            warmup: "划船机 5min + 肩胛激活（弹力带面拉×15、悬挂×20s×2）",
            workouts: [
                { id: "w4_1", name: "引体向上 (或高位下拉)", sets: "4×6–10", remark: "主项，背阔" },
                { id: "w4_2", name: "杠铃划船（俯身）", sets: "3×8–10", remark: "中背厚度" },
                { id: "w4_3", name: "坐姿绳索划船（窄握）", sets: "3×10–12", remark: "中背挤压" },
                { id: "w4_4", name: "单臂哑铃划船", sets: "3×10/侧", remark: "单边平衡" },
                { id: "w4_5", name: "杠铃弯举", sets: "3×10–12", remark: "二头" },
                { id: "w4_6", name: "锤式弯举", sets: "3×12", remark: "肱肌+前臂" },
                { id: "w4_7", name: "【晚训】稳态有氧(爬楼机)", sets: "30min", remark: "档位6-8, 身体直立" }
            ],
            meals: [
                { id: "m4_1", time: "7:00", title: "晨起", desc: "黑咖啡 200ml + 甜菜根粉 3–6g 冲水" },
                { id: "m4_2", time: "7:20", title: "训练前小餐", desc: "香蕉 1 根 + 乳清蛋白粉 12g 兑水 (约180kcal)" },
                { id: "m4_3", time: "8:00-10:00", title: "早训", desc: "上肢拉训练" },
                { id: "m4_4", time: "10:15", title: "训练后早餐", desc: "燕麦片40g + 牛奶250ml + 蓝莓50g; 全蛋2个+蛋白2个; 鸡胸80g/牛肉60g; 肌酸5g (约550kcal)" },
                { id: "m4_5", time: "12:00", title: "食堂午餐", desc: "主食1拳量(约150g) + 蛋白1掌量(约120g) + 绿叶菜2份 (约600kcal)" },
                { id: "m4_6", time: "15:30", title: "加餐", desc: "无糖希腊酸奶150g + 原味坚果15g (约220kcal)" },
                { id: "m4_7", time: "18:00", title: "食堂晚餐", desc: "主食1拳量(120g) + 蛋白1掌量(110g) + 绿叶菜2份 (约480kcal)" },
                { id: "m4_8", time: "21:00-21:30", title: "晚训", desc: "稳态有氧 30min" },
                { id: "m4_9", time: "22:00", title: "训练后恢复", desc: "乳清蛋白粉 25g + 牛奶 200ml (约220kcal)" },
                { id: "m4_10", time: "22:30", title: "睡前(可选)", desc: "甘氨酸镁 200–400mg" }
            ]
        },
        "5": { // 周五
            dayName: "周五",
            workoutType: "全身复合 + 核心 + 晚HIIT",
            warmup: "跳绳 3min + 全身动态拉伸 5min",
            workouts: [
                { id: "w5_1", name: "高脚杯深蹲", sets: "3×10", remark: "全身唤醒" },
                { id: "w5_2", name: "哑铃推举 + 弓步走", sets: "3×8/侧", remark: "复合动作" },
                { id: "w5_3", name: "引体向上 或 高位下拉", sets: "3×8–10", remark: "拉链补充" },
                { id: "w5_4", name: "壶铃摆荡（俄式）", sets: "3×15", remark: "髋铰链爆发" },
                { id: "w5_5", name: "农夫行走", sets: "3×30m", remark: "握力+核心" },
                { id: "w5_6", name: "核心循环", sets: "3轮", remark: "平板45s+卷腹15次+俄转20次+死虫10/侧" },
                { id: "w5_7", name: "【晚训】HIIT 15min", sets: "6-7轮", remark: "30s中高强度+60s慢走" }
            ],
            meals: [
                { id: "m5_1", time: "7:00", title: "晨起", desc: "黑咖啡 200ml + 甜菜根粉 3–6g 冲水" },
                { id: "m5_2", time: "7:20", title: "训练前小餐", desc: "香蕉 1 根 + 乳清蛋白粉 12g 兑水 (约180kcal)" },
                { id: "m5_3", time: "8:00-10:00", title: "早训", desc: "全身复合训练" },
                { id: "m5_4", time: "10:15", title: "训练后早餐", desc: "燕麦片40g + 牛奶250ml + 蓝莓50g; 全蛋2个+蛋白2个; 鸡胸80g/牛肉60g; 肌酸5g (约550kcal)" },
                { id: "m5_5", time: "12:00", title: "食堂午餐", desc: "主食1拳量(约150g) + 蛋白1掌量(约120g) + 绿叶菜2份 (约600kcal)" },
                { id: "m5_6", time: "15:30", title: "加餐", desc: "无糖希腊酸奶150g + 原味坚果15g (约220kcal)" },
                { id: "m5_7", time: "18:00", title: "食堂晚餐(轻量)", desc: "半拳主食(白肉+蔬菜，避免杂粮和红肉) (约320kcal)" },
                { id: "m5_8", time: "19:00-19:30", title: "晚训", desc: "HIIT 15min" },
                { id: "m5_9", time: "19:45", title: "训练后恢复", desc: "乳清蛋白粉 25g + 牛奶 200ml + 1小香蕉 (约220kcal)" },
                { id: "m5_10", time: "21:30", title: "睡前轻餐", desc: "酸奶150g+蓝莓+杏仁 / 水煮蛋2个+黄瓜 (约200kcal)" },
                { id: "m5_11", time: "22:30", title: "睡前(可选)", desc: "甘氨酸镁 200–400mg" }
            ]
        },
        "6": { // 周六
            dayName: "周六",
            workoutType: "中等强度有氧 40–50 min",
            warmup: "5min 快走/低档热身",
            workouts: [
                { id: "w6_1", name: "有氧 (跑步机或爬楼机)", sets: "40min", remark: "心率130-140，建议交替进行" },
                { id: "w6_2", name: "拉伸放松", sets: "5min", remark: "" }
            ],
            meals: [
                { id: "m6_1", time: "7:00", title: "晨起", desc: "黑咖啡 200ml + 甜菜根粉 3–6g 冲水" },
                { id: "m6_2", time: "7:20", title: "训练前小餐", desc: "香蕉 1 根 + 乳清蛋白粉 12g 兑水 (约180kcal)" },
                { id: "m6_3", time: "8:00-10:00", title: "早训", desc: "中等强度有氧" },
                { id: "m6_4", time: "10:15", title: "训练后早餐", desc: "燕麦片40g + 牛奶250ml + 蓝莓50g; 全蛋2个+蛋白2个; 鸡胸80g/牛肉60g; 肌酸5g (约550kcal)" },
                { id: "m6_5", time: "12:00", title: "午餐", desc: "主食1拳量 + 蛋白1掌量 + 绿叶菜2份" },
                { id: "m6_6", time: "15:30", title: "加餐", desc: "无糖希腊酸奶150g + 原味坚果15g" },
                { id: "m6_7", time: "18:00", title: "晚餐", desc: "主食1拳量 + 蛋白1掌量 + 绿叶菜2份" },
                { id: "m6_8", time: "22:30", title: "睡前(可选)", desc: "甘氨酸镁 200–400mg" }
            ]
        },
        "0": { // 周日
            dayName: "周日",
            workoutType: "休息",
            warmup: "无",
            workouts: [
                { id: "w0_1", name: "户外散步 (可选)", sets: "30-45min", remark: "不计入负荷" },
                { id: "w0_2", name: "全身静态拉伸", sets: "15min", remark: "每个部位30s" },
                { id: "w0_3", name: "泡沫轴放松", sets: "10min", remark: "促进恢复" }
            ],
            meals: [
                { id: "m0_1", time: "10:15", title: "早餐", desc: "燕麦25g(半量) + 牛奶250ml + 全蛋2个+蛋白2个 + 肉类 (无香蕉); 肌酸5g" },
                { id: "m0_2", time: "12:00", title: "午餐", desc: "主食半拳量(约80g) + 蛋白1掌量 + 绿叶菜" },
                { id: "m0_3", time: "15:30", title: "加餐", desc: "无糖希腊酸奶150g + 原味坚果15g" },
                { id: "m0_4", time: "18:00", title: "晚餐", desc: "主食半拳量 + 蛋白1掌量 + 绿叶菜" },
                { id: "m0_5", time: "21:30", title: "夜宵(可选)", desc: "小份酸奶 100g" },
                { id: "m0_6", time: "22:30", title: "睡前(可选)", desc: "甘氨酸镁 200–400mg" }
            ]
        }
    },
    supplements: [
        { name: "乳清蛋白粉", dose: "12g + 25g", time: "早训前 + 晚训后" },
        { name: "肌酸一水", dose: "5g/天", time: "随 10:15 大餐" },
        { name: "甜菜根粉", dose: "3–6g", time: "早训前 30–45min" },
        { name: "维生素 D3", dose: "2000 IU/天", time: "早餐随餐" },
        { name: "鱼油(EPA+DHA)", dose: "≥1000mg/天", time: "10:15 或 14:00 随餐" },
        { name: "复合维生素", dose: "1 片/天", time: "早餐随餐" },
        { name: "咖啡因", dose: "200mg", time: "早训前 (7:00), 晚禁" },
        { name: "甘氨酸镁", dose: "200-400mg", time: "22:30 睡前" }
    ],
    rules: [
        "早训不空腹，7:20 必吃训前加餐",
        "晚训严禁大重量深蹲/硬拉",
        "晚训后至少 90min 才能睡觉",
        "睡眠不足 7h，训练降为低强度有氧",
        "平台期绝不将热量降至 BMR(1716) 以下",
        "连续 3 天异常疲劳需插入完全休息日",
        "复合大重量主项（深蹲/硬拉/卧推）组间休息 2–3 分钟",
        "孤立/器械动作（如侧平举/弯举）组间休息 60–90 秒",
        "切换不同动作（换器械）之间，一般休息 2–3 分钟以缓冲中枢神经"
    ]
};
