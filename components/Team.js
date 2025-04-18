import useTranslation from 'next-translate/useTranslation'
import styles from '../styles/Home.module.css'
import { Container, Row, Col } from 'react-bootstrap'
import Image from 'next/image'
import Divider from './Divider'

const Team = ({ profiles, employees }) => {

  const { t } = useTranslation()

  return (
    <Container>
      <Row className={styles.smallDivider}>
        <Col>
          <div className='mb-5'>
            <Image src={'https:' + profiles.ripalta} width={200} height={150}/>
            <h5 className='marginBottomNull'>Rafael Joaquín Ripalta Romeo</h5>
            <span className={styles.highlight}>{t('home:founder')}</span>
            <ul className={`topSpace ${styles.listBorder}`}>
              {t('home:ripaltaBio').split('&&').map((text, idx) => (
                <li key={idx}>{text}</li>
              ))}
            </ul>
          </div>
        </Col>
        <Col>
          <div className='mb-5'>
            <Image src={'https:' + profiles.martinez} width={200} height={260}/>
            <h5 className='marginBottomNull'>Sebastián Martínez de Trincheria</h5>
            <span className={styles.highlight}>{t('home:founder')}</span>
            <ul className={`topSpace ${styles.listBorder}`}>
              {t('home:martinezBio').split('&&').map((text, idx) => (
                <li key={idx}>{text}</li>
              ))}
            </ul>
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <div className='mb-5'>
            <Image src={'https:' + profiles.sais} width={200} height={150}/>
            <h5 className='marginBottomNull'>Jordi Sais Giralt</h5>
            <span className={styles.highlight}>{t('home:partner')}</span>
            <ul className={`topSpace ${styles.listBorder}`}>
              {t('home:saisBio').split('&&').map((text, idx) => (
                <li key={idx}>{text}</li>
              ))}
            </ul>
          </div>
        </Col>
        <Col>
        </Col>
      </Row>
      <Divider styles={styles} />
      <Row>
        {employees && employees?.map((employee, idx) => (
          <Col key={idx} lg={3}>
            <h5 className={styles.highlightUnderline}>{employee.fields.name}</h5>
            <ul className={styles.listBorder}>
              <li>{employee.fields[`role_${t('home:language')}`]}</li>
              <li>{employee.fields[`department_${t('home:language')}`]}</li>
              <li>E-mail: {employee.fields.email}</li>
            
              {/* {t('home:dominguezBio').split('&&').map((text, idx) => (
                <li key={idx}>{text}</li>
              ))} */}
            </ul>
          </Col>
        ))}
      </Row>
     
    </Container>
  )
}

export default Team