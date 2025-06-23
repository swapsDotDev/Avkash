def get_birthday_email(username, org_name):
    subject = "🎂 Happy Birthday!"

    message = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Happy Birthday!</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">

        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: #ffffff;">
          <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
          <h1 style="margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            Happy Birthday!
          </h1>
          <div style="font-size: 24px; margin-top: 10px;">🎂✨</div>
        </div>

        <div style="padding: 40px 30px;">
          <p style="font-size: 18px; color: #333333; line-height: 1.6; margin: 0 0 20px 0;">
            Dear <strong style="color: #667eea;">{username}</strong>,
          </p>

          <div style="background-color: #f8f9ff; padding: 25px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
            <p style="font-size: 16px; color: #555555; line-height: 1.7; margin: 0;">
              🎈 On your special day, we want to let you know how much we appreciate the
              <strong> energy</strong>, <strong>positivity</strong>, and <strong>dedication</strong> you
              bring to our team every single day.
            </p>
          </div>

          <p style="font-size: 16px; color: #555555; line-height: 1.7; margin: 20px 0;">
            We hope your birthday is filled with:
          </p>

          <div style="margin: 20px 0;">
            <div style="display: flex; align-items: center; margin: 10px 0;">
              <span style="font-size: 20px; margin-right: 10px;">😄</span>
              <span style="font-size: 16px; color: #555555;">Lots of laughter and joy</span>
            </div>
            <div style="display: flex; align-items: center; margin: 10px 0;">
              <span style="font-size: 20px; margin-right: 10px;">❤️</span>
              <span style="font-size: 16px; color: #555555;">Love from family and friends</span>
            </div>
            <div style="display: flex; align-items: center; margin: 10px 0;">
              <span style="font-size: 20px; margin-right: 10px;">🍰</span>
              <span style="font-size: 16px; color: #555555;">Delicious cake and treats</span>
            </div>
          </div>

          <div style="background-color: #fff7e6; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <p style="font-size: 16px; color: #d97706; margin: 0; font-style: italic;">
              ✨ May this coming year bring you exciting opportunities and continued success! 🌟
            </p>
          </div>

          <p style="font-size: 16px; color: #555555; line-height: 1.7; margin: 20px 0;">
            Enjoy every moment — you deserve all the happiness in the world! 🥳
          </p>
        </div>

        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="font-size: 16px; color: #666666; margin: 0; line-height: 1.6;">
            Warmest birthday wishes,<br />
            <strong style="color: #667eea; font-size: 18px;">The {org_name} Team 🎉</strong>
          </p>
        </div>
      </div>
    </body>
    </html>
    """
    return subject, message


def get_anniversary_email(username, org_name, years):
    subject = f"🎉 Celebrating {years} Year{'s' if years > 1 else ''} of Excellence at {org_name}!"

    message = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Work Anniversary Email</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center; color: #ffffff;">
          <div style="font-size: 48px; margin-bottom: 10px;">🏆</div>
          <h1 style="margin: 0; font-size: 26px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1); line-height: 1.3;">
            Celebrating {years} Year{'s' if years > 1 else ''} of Excellence
          </h1>
          <div style="font-size: 24px; margin-top: 10px;">🎊✨</div>
        </div>

        <div style="padding: 40px 30px;">
          <p style="font-size: 18px; color: #333333; line-height: 1.6; margin: 0 0 20px 0;">
            Dear <strong style="color: #f5576c;">{username}</strong>,
          </p>

          <div style="background-color: #fff5f5; padding: 30px; border-radius: 12px; text-align: center; margin: 25px 0; border: 2px solid #fed7d7;">
            <div style="font-size: 36px; margin-bottom: 15px;">🎉</div>
            <h2 style="font-size: 24px; color: #f5576c; margin: 0 0 10px 0; font-weight: bold;">
              Congratulations on Your {years}-Year Work Anniversary!
            </h2>
            <div style="font-size: 20px;">🏅</div>
          </div>

          <p style="font-size: 16px; color: #555555; line-height: 1.7; margin: 25px 0;">
            Today, we celebrate <strong>you</strong> and the incredible journey you've taken with
            <strong style="color: #f5576c;">{org_name}</strong>. Your contributions have been nothing short of remarkable.
          </p>

          <div style="background-color: #f0fff4; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <h3 style="font-size: 18px; color: #065f46; margin: 0 0 15px 0; text-align: center;">
              What You've Brought to Our Team:
            </h3>
            <div style="margin: 15px 0;">
              <div style="display: flex; align-items: center; margin: 12px 0;">
                <span style="font-size: 20px; margin-right: 12px;">💼</span>
                <span style="font-size: 16px; color: #065f46;">
                  <strong>Hard Work</strong> - Your dedication inspires us all
                </span>
              </div>
              <div style="display: flex; align-items: center; margin: 12px 0;">
                <span style="font-size: 20px; margin-right: 12px;">🙌</span>
                <span style="font-size: 16px; color: #065f46;">
                  <strong>Commitment</strong> - Always going above and beyond
                </span>
              </div>
              <div style="display: flex; align-items: center; margin: 12px 0;">
                <span style="font-size: 20px; margin-right: 12px;">💡</span>
                <span style="font-size: 16px; color: #065f46;">
                  <strong>Innovation</strong> - Bringing fresh ideas and solutions
                </span>
              </div>
              <div style="display: flex; align-items: center; margin: 12px 0;">
                <span style="font-size: 20px; margin-right: 12px;">🌟</span>
                <span style="font-size: 16px; color: #065f46;">
                  <strong>Leadership</strong> - Helping shape our culture and success
                </span>
              </div>
            </div>
          </div>

          <div style="background-color: #fef3c7; padding: 25px; border-radius: 8px; text-align: center; margin: 25px 0;">
            <p style="font-size: 17px; color: #92400e; margin: 0; font-weight: 500; line-height: 1.6;">
              🚀 We're grateful to have you with us and look forward to many more milestones, achievements, and successes together!
            </p>
          </div>

          <p style="font-size: 16px; color: #555555; line-height: 1.7; margin: 25px 0 0 0;">
            Here's to celebrating not just the years you've been with us, but the incredible impact you've made every single day. 🌈
          </p>
        </div>

        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="font-size: 16px; color: #666666; margin: 0; line-height: 1.6;">
            With heartfelt appreciation,<br/>
            <strong style="color: #f5576c; font-size: 18px;">The {org_name} Team 💝</strong>
          </p>
          <div style="margin-top: 20px; font-size: 14px; color: #999999; font-style: italic;">
            Thank you for being an irreplaceable part of our journey! 🙏
          </div>
        </div>
      </div>
    </body>
    </html>
    """
    return subject, message
