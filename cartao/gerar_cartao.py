"""Gera o cartão de acesso dos avaliadores (QR code + senha + instruções), em A4.

Uso:  python gerar_cartao.py https://SEU-SITE.vercel.app "senha de avaliação" [saida.pdf]
Dependências: pip install segno reportlab
A senha NÃO fica no repositório: ela só existe no PDF gerado.
"""
import sys
import segno
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.pdfgen import canvas

if len(sys.argv) < 3:
    sys.exit(__doc__)
base = sys.argv[1].rstrip('/')
senha = sys.argv[2]
saida = sys.argv[3] if len(sys.argv) > 3 else 'cartao-avaliador.pdf'
url = base + '/avaliar'

BG, TEAL, TEAL_HI, PURPLE, DARK = HexColor('#0D1117'), HexColor('#4F98A3'), HexColor('#6FC3CE'), HexColor('#7C6FCD'), HexColor('#161B22')
c = canvas.Canvas(saida, pagesize=A4)
W, H = A4

# Faixa superior no tema do site
c.setFillColor(BG); c.rect(0, H - 70 * mm, W, 70 * mm, stroke=0, fill=1)
c.setFillColor(PURPLE); c.rect(0, H - 72 * mm, W, 2 * mm, stroke=0, fill=1)
c.setFillColor(TEAL_HI); c.setFont('Helvetica-Bold', 10); c.drawString(20 * mm, H - 22 * mm, 'UNINORTE  ·  CIÊNCIA DA COMPUTAÇÃO  ·  EXTENSÃO IV')
c.setFillColor(white); c.setFont('Helvetica-Bold', 34); c.drawString(20 * mm, H - 40 * mm, 'Avalie os pitches')
c.setFillColor(HexColor('#C9D1D9')); c.setFont('Helvetica', 13)
c.drawString(20 * mm, H - 53 * mm, '8 projetos de estudantes para comunidades locais de Manaus.')
c.drawString(20 * mm, H - 60 * mm, 'Sua nota ajuda a escolher os melhores.')

# QR code
qr = segno.make(url, error='m')
n = len(qr.matrix) + 2 * 2  # borda de 2 módulos
lado = 78 * mm
mod = lado / n
x0, y0 = (W - lado) / 2, H - 72 * mm - 14 * mm - lado
c.setFillColor(white); c.setStrokeColor(TEAL); c.setLineWidth(2.5)
c.roundRect(x0 - 5 * mm, y0 - 5 * mm, lado + 10 * mm, lado + 10 * mm, 6 * mm, stroke=1, fill=1)
c.setFillColor(HexColor('#0D1117'))
for r, linha in enumerate(qr.matrix):
    for k, v in enumerate(linha):
        if v:
            c.rect(x0 + (k + 2) * mod, y0 + lado - (r + 3) * mod, mod + 0.15, mod + 0.15, stroke=0, fill=1)

c.setFillColor(HexColor('#0D1117')); c.setFont('Helvetica-Bold', 14)
c.drawCentredString(W / 2, y0 - 14 * mm, 'Aponte a câmera do celular para o QR code')
c.setFillColor(HexColor('#4F98A3')); c.setFont('Helvetica', 11)
c.drawCentredString(W / 2, y0 - 20 * mm, url)

# Senha
by = y0 - 50 * mm
c.setFillColor(DARK); c.setStrokeColor(PURPLE); c.setLineWidth(2)
c.roundRect(40 * mm, by, W - 80 * mm, 24 * mm, 5 * mm, stroke=1, fill=1)
c.setFillColor(TEAL_HI); c.setFont('Helvetica-Bold', 9); c.drawCentredString(W / 2, by + 17 * mm, 'SENHA DE ACESSO')
c.setFillColor(white); c.setFont('Courier-Bold', 28); c.drawCentredString(W / 2, by + 6 * mm, senha)

# Instruções
passos = [
    'Aponte a câmera para o QR code e abra o link.',
    'Informe o seu nome (assim sabemos quem avaliou).',
    'Digite a senha de acesso acima e toque em Entrar.',
    'Para cada equipe, dê notas de 0 a 10 nos 6 critérios e toque em Salvar.',
    'Pode voltar e ajustar suas notas a qualquer momento.',
]
y = by - 14 * mm
c.setFillColor(HexColor('#0D1117')); c.setFont('Helvetica-Bold', 13); c.drawString(25 * mm, y, 'Como avaliar')
y -= 9 * mm
for i, t in enumerate(passos, 1):
    c.setFillColor(TEAL); c.circle(29 * mm, y + 1.5 * mm, 3.4 * mm, stroke=0, fill=1)
    c.setFillColor(white); c.setFont('Helvetica-Bold', 10); c.drawCentredString(29 * mm, y * 1 + 0.2 * mm, str(i))
    c.setFillColor(HexColor('#1F2933')); c.setFont('Helvetica', 11.5); c.drawString(37 * mm, y, t)
    y -= 9 * mm

c.setFillColor(HexColor('#6B7280')); c.setFont('Helvetica', 9)
c.drawCentredString(W / 2, 14 * mm, 'Critérios: problema e relevância · solução e produto · inovação · valor para empresas · impacto social · clareza')
c.showPage(); c.save()
print('PDF gerado:', saida)
