from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color, white
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"digest"/"releases"/"IIG-Monthly-Digest-2026-09-PUBLIC.pdf"
OUT.parent.mkdir(parents=True,exist_ok=True)
COVER=ROOT/"Вариант шапки сайта_промкомплекса на рассвете ( розово-фиалетовый).png"
BASE="https://developiig-hue.github.io/IIG_PLATFORM_DEMO/"
W,H=612,864

pdfmetrics.registerFont(TTFont("DV","/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DVB","/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
c=canvas.Canvas(str(OUT),pagesize=(W,H),pageCompression=1)
NAVY=HexColor("#08365d"); RED=HexColor("#ff3b35"); ORANGE=HexColor("#ec6b2c"); GREEN=HexColor("#198a52"); INK=HexColor("#0b3158"); LINE=HexColor("#d5e0e7"); BG=HexColor("#f5f8fa")

def t(x,y,s,size=10,b=False,color=INK):
    c.setFillColor(color); c.setFont("DVB" if b else "DV",size); c.drawString(x,y,s)

def wrap(s,maxw,size=10,b=False):
    font="DVB" if b else "DV"; lines=[]; cur=""
    for w in s.split():
        z=(cur+" "+w).strip()
        if stringWidth(z,font,size)<=maxw: cur=z
        else:
            if cur: lines.append(cur)
            cur=w
    if cur: lines.append(cur)
    return lines

def wt(x,y,s,maxw,size=10,leading=None,b=False,color=INK,maxlines=None):
    leading=leading or size*1.2; lines=wrap(s,maxw,size,b)
    if maxlines: lines=lines[:maxlines]
    for line in lines:
        t(x,y,line,size,b,color); y-=leading
    return y

# PAGE 1
img=ImageReader(str(COVER)); iw,ih=img.getSize(); scale=max(W/iw,H/ih); dw,dh=iw*scale,ih*scale
c.drawImage(img,(W-dw)/2,(H-dh)/2,dw,dh)
c.setFillColor(Color(5/255,40/255,68/255,alpha=.55)); c.rect(0,0,W,H,fill=1,stroke=0)
t(28,816,"IIG",30,True,white); c.setStrokeColor(white); c.line(80,810,80,838)
t(94,828,"INDUSTRY",7,True,white); t(94,818,"INTELLIGENCE GENERATION (IIG)",7,True,white); t(553,828,"UA / EN",7,True,white)
t(28,765,"MONTHLY DIGEST",36,True,white); t(28,733,"ПРОМИСЛОВОЇ ЕНЕРГЕТИКИ",15,True,white)
c.setFillColor(RED); c.roundRect(28,693,120,32,0,fill=1,stroke=0); t(42,704,"ВЕРЕСЕНЬ 2026",10,True,white)
t(28,659,"Енергія відновлення.",17,True,white); t(28,636,"Інвестиції в майбутнє",17,True,white); t(28,613,"промисловості України",17,True,white)
topics=[
("⚡","Генерація промисловості – Україна:","ключові проєкти та тенденції місяця",BASE+"industry.html?sector=energy"),
("◎","Світова практика промислової енергетики:","інновації, технології, кейси",BASE+"news.html"),
("§","Фінансування та державне регулювання:","можливості та зміни для бізнесу",BASE+"finance-news.html"),
("●","Поради Головного інженера:","практичні рішення та рекомендації",BASE+"advice.html")]
for y,(ico,title,desc,url) in zip([560,495,430,365],topics):
    t(30,y,ico,18,False,white); yy=wt(66,y+2,title,480,12,14,True,white,2); t(66,yy-1,desc,8,False,white); t(66,yy-14,"Читати далі...",8,True,white); c.linkURL(url,(25,y-28,570,y+20),relative=0)
c.setFillColor(Color(8/255,47/255,81/255,alpha=.93)); c.roundRect(28,82,556,72,8,fill=1,stroke=0)
kpis=[("50","найважливіших\nновин місяця"),("24","країни світу\nв центрі аналітики"),("13","державних інвестицій\nта міжнародних ініціатив"),("13","проєктів у фокусі:\nенергетика, промисловість")]
for i,(num,lab) in enumerate(kpis):
    cx=28+69.5+i*139; t(cx,124,num,16,True,white)
    for j,line in enumerate(lab.split("\n")): t(cx-20,107-j*8,line,5.7,False,white)
c.setFillColor(RED); c.roundRect(28,25,269,40,7,fill=1,stroke=0); t(76,40,"РОЗМІСТИТИ ПРОЄКТ",14,True,white); c.linkURL(BASE+"forms.html#project",(28,25,297,65),relative=0)
c.setFillColor(ORANGE); c.roundRect(307,25,277,40,7,fill=1,stroke=0); t(337,40,"ПІДПИСАТИСЯ НА ДАЙДЖЕСТ",14,True,white); c.linkURL(BASE+"forms.html#subscribe",(307,25,584,65),relative=0)
c.showPage()

# PAGE 2
c.setFillColor(BG); c.rect(0,0,W,H,fill=1,stroke=0)
t(25,832,"IIG INDUSTRY INTELLIGENCE · 02",6,True,HexColor("#71879a")); t(25,794,"УКРАЇНА ТА СВІТ — 15 ПОДІЙ У ФОКУСІ",16,True,INK)
c.setFillColor(ORANGE); c.rect(444,783,143,24,fill=1,stroke=0); t(458,792,"ПІДПИСАТИСЯ НА ДАЙДЖЕСТ",7,True,white); c.linkURL(BASE+"forms.html#subscribe",(444,783,587,807),relative=0)
items=[
("AGRI / SOLAR","Kernel: ЄБРР підтримує сонячний проєкт 106 МВт із BESS","kernel-106mw-solar-bess-ebrd",False),
("WIND","Galnaftogaz / OKKO: фінансування ВЕС 189 МВт","ebrd-189mw-wind-galnaftogaz",False),
("METALLURGY","U. S. Steel Košice: €0,9 млрд в EAF та ASU","kosice-eaf-asu-2026",False),
("FOOD","Nestlé відкрила Agri-PV біля заводу Biessenhofen","nestle-biessenhofen-agri-pv-2026",False),
("LOGISTICS","DHL і LONGi: сонячна генерація для логістики","dhl-longi-solar-mou-2026",False),
("DATACENTERS","Google: €13 млрд у ШІ-інфраструктуру Фінляндії","google-finland-ai-grid-2026",False),
("CHEMICAL","BASF: модернізоване виробництво в Ludwigshafen","basf-ludwigshafen-renewable-accc-2026",False),
("INDUSTRY","Solar Foods: €77,8 млн фінансування Factory 02","solarfoods-factory02-financing-2026",False),
("WASTE","Kanadevia / Indaver: комплекс Rivenhall","rivenhall-waste-energy-handover-2026",False),
("PHARMA","Novartis: завод радіолігандної терапії в Denton","novartis-denton-rlt-groundbreaking-2026",False),
("REGULATION","НКРЕКП №1355: зміни до Кодексу систем розподілу","nkrekp-1355-distribution-code-2026",True),
("REGULATION","Законопроєкт №16033: безпека постачання електроенергії","bill-16033-security-of-electricity-supply-2026",True),
("REGULATION","Уряд оновив правила аукціонів підтримки ВДЕ","kmu-renewables-auctions-rules-2026",True),
("REGULATION","НКРЕКП: нові механізми приєднання до електромереж","nkrekp-grid-connection-2026",True),
("REGULATION","Закон №4777-IX: нові умови для енергоринків, ВДЕ та накопичення","law-4777-ix-energy-markets-resilience-2026",True)]
y=748; h=39
for i,(cat,title,slug,green) in enumerate(items,1):
    c.setFillColor(white); c.setStrokeColor(LINE); c.roundRect(25,y-h+3,562,h-4,5,fill=1,stroke=1)
    t(35,y-20,f"{i:02}",9,True,HexColor("#8ca0af")); t(68,y-13,cat,5,True,GREEN if green else HexColor("#ee3f42"))
    wt(68,y-26,title,480,9.6,11,True,INK,2); t(558,y-22,"→",11,True,HexColor("#0d6092")); c.linkURL(BASE+"article.html?id="+slug,(25,y-h+3,587,y-1),relative=0); y-=h
c.setStrokeColor(HexColor("#b9c7d0")); c.roundRect(25,99,562,50,5,fill=0,stroke=1); t(36,131,"МОЖЛИВЕ ПРОДОВЖЕННЯ ВИПУСКУ · НЕ АКТИВОВАНО",5.5,True,HexColor("#6e8392")); t(36,115,"IIG ORIGINAL / PARTNER MATERIAL / SPONSORED — тільки після окремого editorial/admin approval.",5.5,False,HexColor("#6e8392"))
c.setStrokeColor(HexColor("#cbd6dd")); c.line(25,51,587,51); t(25,35,"IIG Monthly Digest · Вересень 2026 · 2/3",5.5,False,HexColor("#6f8291")); c.setFillColor(ORANGE); c.rect(444,24,143,20,fill=1,stroke=0); t(458,31,"ПІДПИСАТИСЯ НА ДАЙДЖЕСТ",6,True,white); c.linkURL(BASE+"forms.html#subscribe",(444,24,587,44),relative=0)
c.showPage()

# PAGE 3
c.setFillColor(BG); c.rect(0,0,W,H,fill=1,stroke=0)
t(25,832,"IIG INDUSTRY INTELLIGENCE · 03",6,True,HexColor("#71879a")); t(25,794,"ФІНАНСИ · РЕГУЛЮВАННЯ · ІНЖЕНЕРНА ПРАКТИКА",15,True,INK)
c.setFillColor(ORANGE); c.rect(444,783,143,24,fill=1,stroke=0); t(458,792,"ПІДПИСАТИСЯ НА ДАЙДЖЕСТ",7,True,white); c.linkURL(BASE+"forms.html#subscribe",(444,783,587,807),relative=0)
c.setFillColor(white); c.setStrokeColor(LINE); c.roundRect(25,650,562,105,7,fill=1,stroke=1); t(38,728,"ФІНАНСУВАННЯ ЕНЕРГЕТИЧНИХ ПРОЄКТІВ",11,True,GREEN)
fin=[("EBRD / EIB","генерація, ВДЕ, BESS",BASE+"finance-news.html?institution=eib"),("BANKABILITY","CAPEX · connection · guarantees",BASE+"finance-news.html"),("PROJECT FINANCE","debt · equity · ECA",BASE+"financing.html")]
for i,(a,b,url) in enumerate(fin):
    x=38+i*177; c.setFillColor(HexColor("#eef4f7")); c.roundRect(x,668,164,42,4,fill=1,stroke=0); t(x+8,691,a,8,True,GREEN); t(x+8,677,b,5.8,False,INK); c.linkURL(url,(x,668,x+164,710),relative=0)
c.setFillColor(white); c.setStrokeColor(LINE); c.roundRect(25,352,562,278,7,fill=1,stroke=1); t(38,604,"ЗАКОНОДАВСТВО ТА РЕГУЛЮВАННЯ ЕНЕРГЕТИКИ",11,True,GREEN)
regs=[("НКРЕКП №1355: зміни до Кодексу систем розподілу","nkrekp-1355-distribution-code-2026"),("Законопроєкт №16033: безпека постачання електроенергії","bill-16033-security-of-electricity-supply-2026"),("Уряд оновив правила аукціонів підтримки ВДЕ","kmu-renewables-auctions-rules-2026"),("НКРЕКП: нові механізми приєднання до електромереж","nkrekp-grid-connection-2026"),("Закон №4777-IX: нові умови для енергоринків, ВДЕ та накопичення","law-4777-ix-energy-markets-resilience-2026"),("НКРЕКП №1461: умови приєднання BESS до 1 січня 2027","nkrekp-1461-bess-connection-2026")]
y=570
for title,slug in regs:
    c.setStrokeColor(HexColor("#dce5e9")); c.roundRect(38,y-31,536,31,5,fill=0,stroke=1); t(48,y-20,"§",9,True,GREEN); wt(66,y-17,title,460,8.3,10,True,INK,2); t(555,y-20,"→",9,True,GREEN); c.linkURL(BASE+"article.html?id="+slug,(38,y-31,574,y),relative=0); y-=38
c.setFillColor(NAVY); c.roundRect(25,92,562,236,8,fill=1,stroke=0); t(40,304,"ПОРАДИ ГОЛОВНОГО ІНЖЕНЕРА",11,True,white)
adv=[("Приєднання генерації після вересневих змін НКРЕКП: що перевірити до EPC","grid-connection-september-rules"),("BESS: спочатку функція системи, потім MW і MWh","bess-duty-before-mwh"),("Onsite generation: проєктуйте від навантаження до генератора, а не навпаки","onsite-power-for-ai-and-industry")]
y=270
for title,slug in adv:
    wt(40,y,title,430,8,10,True,white,2); t(500,y,"Детальніше →",5.5,False,white); c.linkURL(BASE+"advice-article.html?id="+slug,(35,y-18,570,y+8),relative=0); y-=48
c.setFillColor(RED); c.roundRect(40,116,247,36,4,fill=1,stroke=0); t(77,128,"РОЗМІСТИТИ ПРОЄКТ",12,True,white); c.linkURL(BASE+"forms.html#project",(40,116,287,152),relative=0)
c.setFillColor(ORANGE); c.roundRect(300,116,247,36,4,fill=1,stroke=0); t(320,128,"ПІДПИСАТИСЯ НА ДАЙДЖЕСТ",12,True,white); c.linkURL(BASE+"forms.html#subscribe",(300,116,547,152),relative=0)
c.setStrokeColor(HexColor("#cbd6dd")); c.line(25,51,587,51); t(25,35,"IIG Monthly Digest · Вересень 2026 · 3/3",5.5,False,HexColor("#6f8291")); c.setFillColor(ORANGE); c.rect(444,24,143,20,fill=1,stroke=0); t(458,31,"ПІДПИСАТИСЯ НА ДАЙДЖЕСТ",6,True,white); c.linkURL(BASE+"forms.html#subscribe",(444,24,587,44),relative=0)
c.save()
print("PUBLIC DIGEST PDF BUILT",OUT,OUT.stat().st_size)
