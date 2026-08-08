import type { Meta, StoryObj } from '@storybook/react-vite'

import { Uploader } from './uploader'
import type { UploaderHandlerResponse } from './uploader.types'

const mockHandler = (): Promise<UploaderHandlerResponse> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        cdnUrl:
          'https://dev.static.oabus.com.br/user/019dd924-2182-717b-8d10-3278311608b2/avatar/019def58-d830-7411-bc56-3b606b32fa17.png',
        expiresIn: 900,
        key: 'user/019dd924-2182-717b-8d10-3278311608b2/avatar/019def58-d830-7411-bc56-3b606b32fa17.png',
        upload: {
          fields: {
            bucket: 'oabus-static-dev',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Content-Type': 'image/png',
            key: 'user/019dd924-2182-717b-8d10-3278311608b2/avatar/019def58-d830-7411-bc56-3b606b32fa17.png',
            Policy:
              'eyJleHBpcmF0aW9uIjoiMjAyNi0wNS0wM1QxOTo1Mjo1MFoiLCJjb25kaXRpb25zIjpbWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsMCw1MjQyODgwXSxbImVxIiwiJENvbnRlbnQtVHlwZSIsImltYWdlL3BuZyJdLFsiZXEiLCIka2V5IiwidXNlci8wMTlkZDkyNC0yMTgyLTcxN2ItOGQxMC0zMjc4MzExNjA4YjIvYXZhdGFyLzAxOWRlZjU4LWQ4MzAtNzQxMS1iYzU2LTNiNjA2YjMyZmExNy5wbmciXSx7IkNhY2hlLUNvbnRyb2wiOiJwdWJsaWMsIG1heC1hZ2U9MzE1MzYwMDAsIGltbXV0YWJsZSJ9LHsiQ29udGVudC1UeXBlIjoiaW1hZ2UvcG5nIn0seyJidWNrZXQiOiJvYWJ1cy1zdGF0aWMtZGV2In0seyJYLUFtei1BbGdvcml0aG0iOiJBV1M0LUhNQUMtU0hBMjU2In0seyJYLUFtei1DcmVkZW50aWFsIjoiQVNJQTQ0S0Y3UVkySFpZTlFTVDUvMjAyNjA1MDMvdXMtZWFzdC0xL3MzL2F3czRfcmVxdWVzdCJ9LHsiWC1BbXotRGF0ZSI6IjIwMjYwNTAzVDE5Mzc1MFoifSx7IlgtQW16LVNlY3VyaXR5LVRva2VuIjoiSVFvSmIzSnBaMmx1WDJWakVKUC8vLy8vLy8vLy93RWFDWFZ6TFdWaGMzUXRNU0pHTUVRQ0lETldHZ2d6T1p4RysvdFNja0ZDcGhBMlV5NGdUZDNHaWdrV2pPWWF5Nk9SQWlBZ0J5MHdoT3U3Z0NNYm5TTmlKTm5RaytLWDI3QzE5ZndZbGpKSnNWbGtkeXE4QlFoY0VBQWFERGc0TlRRME5qa3dNek0wT0NJTVVOOGpnM0hid1lRbGNRV0pLcGtGYUpOMVJQZWVTd3FxL21yM0E1TDhiVDQ2QWNCMVNrMUxaTGJKVml4TWtHb1ZMSUZmMW54VVlnc1hKcTYxNkU3UDhmREtGaGowSEo1MEx3SFhsQTFJeUxvY2FDNGZOUW9lMDlGTHBvWkZZWnJDSjhzV0F0dFkxMkExYzQ3VEsrSVBzclBWVnM0aUlQQ1FHK0RBZ1NVa0I4M2toMXd6YWhLbmNkQlRjTDlucnNoU1hqVndYNmRTUzg2UTN2cnk1V2ZnRFNUR0hUT2V5bExzVjlBVGFoT3Jtc3VwWGM1L2tIL0VDMGdBM3hYWWRDRTFmaFRRVDRWeFJRczFNUndnemthWFFUUG5IQnZKakFtaklpamtwSjJxbWsrVWdNckF0a0JoMHEwMUdlVUZHMjdLVEpQNmt0TDNVZUNZY3RPeTBONjhrMHBkU08xemh6S0hPL1l3ditJeElwMEJQNmx5RytieHFqblZjeEs1RXpMNUhjUnRwSW5vQSsvOEdmMDFUbjA2bHV3T09tckc2RHVHbCtuTnVzWHZPRk82dEtqWVRUc0V4RWdtZ3ZaV2xvaWg4VjJxdkwzVS9mUjE3dmhXdStMTTl0aVR2TnZoWkoxTTQwZlNGdERaOHErSUNpc2xZdmh1TnNBcENTSkJuMW14UHg2bHdNb0NoeExnL3lFZEE5VThadlJpc3lkQ2R0SmdrTCtMSTJic0cxWXBVVzd4dDlDeTZ0NnByUUtZWm1BelNBRUZRbUp2SWR5Uk1IRmJOL2w2SFBadGJtSjlrRkxaNVUyOU9mM3ZhUzJ5dWtGdjRsb0pybUNhdE85T0FEZGx1QXZWVU1ua1FBZnRrbytSWW0xSklJNGFVMkVRRTZvU3Z5a0lRcFl0eWs1WWFUMklIU2Q4eVhhUmkwMVdZUDNEd1M2TkIvVlNNVTBtaDd0cnhIWkQ2Y0VaQlJmOFNid0pESWNZWldxbzNuTWRSQ2xnRkZRVkROWnhkSmpPSTI4bzgyZXBHbTgrR1d3MW9JbkVLU2dGajJac0RIcXAvNFI1NnpzcjBvWDgrRnl3OWZwWk9rbFBmeUlaYmJQdlNGZ3BXOUk2Q1pLNEJzQ1IxQlJqZlhkQ3ZUekRKN2ZGcFdzd2RzT2F4SWZQRjRNb1NiUGNqQkFKSVY2UlFzd2kyV3F2YXYrY2ZQaTBkcTB3NGE3ZXp3WTZzZ0hnVS9yTnFnSDNUSlQrS05aTjdjRWtuYStsQk4yZEw0MlZGeWpiUFp2WFJLUEdoSkg0ZHMvM1h2bG1mZER0UmRqUSt0aXRUNGJuMys2OHdlQlEvNXRVUU1kb1hlSm5iWVFnRlY1OHpsNURDNGU5UEh3b3N4bHhBNkxNYTliUnJWZW9qY01pNStKS2tsSncyUjFQT2tqclJwSVZERUpkaEtUWldmaFBpMk1VSDFHMTl1WDdrTUpPNC8xMDRURTAyVUhRU2FtczEyRE02Y3VDeEJzMFNxRUhrOFI0TWpPM2ZzYUROSVk2YlZ3TTd4VmoifSx7ImtleSI6InVzZXIvMDE5ZGQ5MjQtMjE4Mi03MTdiLThkMTAtMzI3ODMxMTYwOGIyL2F2YXRhci8wMTlkZWY1OC1kODMwLTc0MTEtYmM1Ni0zYjYwNmIzMmZhMTcucG5nIn1dfQ==',
            'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
            'X-Amz-Credential':
              'ASIA44KF7QY2HZYNQST5/20260503/us-east-1/s3/aws4_request',
            'X-Amz-Date': '20260503T193750Z',
            'X-Amz-Security-Token':
              'IQoJb3JpZ2luX2VjEJP//////////wEaCXVzLWVhc3QtMSJGMEQCIDNWGggzOZxG+/tSckFCphA2Uy4gTd3GigkWjOYay6ORAiAgBy0whOu7gCMbnSNiJNnQk+KX27C19fwYljJJsVlkdyq8BQhcEAAaDDg4NTQ0NjkwMzM0OCIMUN8jg3HbwYQlcQWJKpkFaJN1RPeeSwqq/mr3A5L8bT46AcB1Sk1LZLbJVixMkGoVLIFf1nxUYgsXJq616E7P8fDKFhj0HJ50LwHXlA1IyLocaC4fNQoe09FLpoZFYZrCJ8sWAttY12A1c47TK+IPsrPVVs4iIPCQG+DAgSUkB83kh1wzahKncdBTcL9nrshSXjVwX6dSS86Q3vry5WfgDSTGHTOeylLsV9ATahOrmsupXc5/kH/EC0gA3xXYdCE1fhTQT4VxRQs1MRwgzkaXQTPnHBvJjAmjIijkpJ2qmk+UgMrAtkBh0q01GeUFG27KTJP6ktL3UeCYctOy0N68k0pdSO1zhzKHO/Ywv+IxIp0BP6lyG+bxqjnVcxK5EzL5HcRtpInoA+/8Gf01Tn06luwOOmrG6DuGl+nNusXvOFO6tKjYTTsExEgmgvZWloih8V2qvL3U/fR17vhWu+LM9tiTvNvhZJ1M40fSFtDZ8q+ICislYvhuNsApCSJBn1mxPx6lwMoChxLg/yEdA9U8ZvRisydCdtJgkL+LI2bsG1YpUW7xt9Cy6t6prQKYZmAzSAEFQmJvIdyRMHFbN/l6HPZtbmJ9kFLZ5U29Of3vaS2yukFv4loJrmCatO9OADdluAvVUMnkQAftko+RYm1JII4aU2EQE6oSvykIQpYtyk5YaT2IHSd8yXaRi01WYP3DwS6NB/VSMU0mh7trxHZD6cEZBRf8SbwJDIcYZWqo3nMdRClgFFQVDNZxdJjOI28o82epGm8+GWw1oInEKSgFj2ZsDHqp/4R56zsr0oX8+Fyw9fpZOklPfyIZbbPvSFgpW9I6CZK4BsCR1BRjfXdCvTzDJ7fFpWswdsOaxIfPF4MoSbPcjBAJIV6RQswi2Wqvav+cfPi0dq0w4a7ezwY6sgHgU/rNqgH3TJT+KNZN7cEkna+lBN2dL42VFyjbPZvXRKPGhJH4ds/3XvlmfdDtRdjQ+titT4bn3+68weBQ/5tUQMdoXeJnbYQgFV58zl5DC4e9PHwosxlxA6LMa9bRrVeojcMi5+JKklJw2R1POkjrRpIVDEJdhKTZWfhPi2MUH1G19uX7kMJO4/104TE02UHQSams12DM6cuCxBs0SqEHk8R4MjO3fsaDNIY6bVwM7xVj',
            'X-Amz-Signature':
              'fc26a15690736e2f4a8d1469309c80379d980a4431c3ea2a9e523403eac6ea4a',
          },
          url: 'https://oabus-static-dev.s3.us-east-1.amazonaws.com/',
        },
      })
    }, 500)
  })

const meta = {
  component: Uploader,
  title: 'Form/Uploader',
} satisfies Meta<typeof Uploader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    handler: mockHandler,
  },
}

export const WithAccept: Story = {
  args: {
    accept: 'image/*',
    handler: mockHandler,
  },
}

export const WithMaxFiles: Story = {
  args: {
    handler: mockHandler,
    maxFiles: 3,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    handler: mockHandler,
  },
}
