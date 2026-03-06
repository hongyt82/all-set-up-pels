import _ from 'lodash';
import React, { useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { IS_DEV } from '../constants/config';
import {
  arrayToObject,
  countData,
  createApiRequestBody,
  deepClone,
  extractAndTransform,
  extractFields,
  filterData,
  findData,
  generateStatistics,
  groupAndAggregate,
  hasData,
  mergeData,
  objectToArray,
  paginateData,
  processData,
  removeDuplicates,
  sortData,
  sortDataMultiple,
} from '../utils';

/**
 * 현재의 테스트 페이지는 API 데이터 처리에 대한 경우 발생에 대한 경우의 부분을 감안하고 시작되었으나
 * 현재 사용하고 있는 함수는 데이터 처리를 위한 경우가 발생시에 언제든
 * 그 상황에 맞게 사용가능하다. 어떠한 위치에서든 사용가능하게 lodashUtils.ts 파일안에 함수로
 * 추가되어 있다.
 * Map ↔ List 변환, 필드 추출, 데이터 가공 등의 기능을 테스트
 */
const ApiDataTestPage: React.FC = () => {
  // 샘플 데이터 상태
  const [sampleData] = useState({
    users: [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        department: 'IT',
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        age: 25,
        department: 'HR',
      },
      {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob@example.com',
        age: 35,
        department: 'IT',
      },
      {
        id: 4,
        name: 'Alice Brown',
        email: 'alice@example.com',
        age: 28,
        department: 'Finance',
      },
      {
        id: 5,
        name: 'Charlie Wilson',
        email: 'charlie@example.com',
        age: 32,
        department: 'IT',
      },
    ],
    products: {
      p001: {
        id: 'p001',
        name: 'Laptop',
        price: 1200,
        category: 'Electronics',
      },
      p002: { id: 'p002', name: 'Mouse', price: 25, category: 'Electronics' },
      p003: {
        id: 'p003',
        name: 'Keyboard',
        price: 75,
        category: 'Electronics',
      },
      p004: { id: 'p004', name: 'Desk', price: 200, category: 'Furniture' },
      p005: { id: 'p005', name: 'Chair', price: 150, category: 'Furniture' },
    },
  });

  // 사용자 입력 상태
  const [selectedFields, setSelectedFields] = useState('id,name,email');
  const [filterCondition, setFilterCondition] = useState('age > 30');
  const [groupByField, setGroupByField] = useState('department');
  const [sortField, setSortField] = useState('name');
  const [customJsonData, setCustomJsonData] = useState('');

  // 결과 상태
  const [results, setResults] = useState<Record<string, any>>({});

  // 1) Map(Object) ↔ List(Array) 변환 + 일부 값만 수정 후 가져옴
  const testMapListConversion = () => {
    const products = sampleData.products;

    if (IS_DEV) {
      console.log('🔄 [Map ↔ List 변환] 시작');
      console.log('📦 원본 Object:', products);
    }

    // Object → Array 변환
    const productList = _.values(products);
    if (IS_DEV) {
      console.log('📋 Object → Array 변환:', productList);
    }

    // 일부 값 수정 (가격 10% 할인)
    const modifiedList = _.map(productList, product => ({
      ...product,
      price: Math.round(product.price * 0.9),
      discount: true,
    }));
    if (IS_DEV) {
      console.log('💰 가격 수정 (10% 할인):', modifiedList);
    }

    // Array → Object 변환 (id를 키로)
    const modifiedObject = _.keyBy(modifiedList, 'id');
    if (IS_DEV) {
      console.log('🔑 Array → Object 변환:', modifiedObject);
    }

    // 특정 조건으로 필터링된 리스트
    const expensiveItems = _.filter(modifiedList, item => item.price > 100);
    if (IS_DEV) {
      console.log('💎 고가 상품 필터링 (>100):', expensiveItems);
      console.log('✅ [Map ↔ List 변환] 완료');
    }

    return {
      originalObject: products,
      convertedToList: productList,
      modifiedList: modifiedList,
      convertedBackToObject: modifiedObject,
      filteredExpensiveItems: expensiveItems,
    };
  };

  // 2) JSON에서 일부 필드만 뽑는 기능
  const testFieldExtraction = () => {
    const users = sampleData.users;
    const fields = selectedFields.split(',').map(f => f.trim());

    if (IS_DEV) {
      console.log('📤 [필드 추출] 시작');
      console.log('👥 원본 사용자 데이터:', users);
      console.log('🎯 선택된 필드:', fields);
    }

    // 특정 필드만 추출
    const extractedFields = _.map(users, user => _.pick(user, fields));
    if (IS_DEV) {
      console.log('📋 추출된 필드:', extractedFields);
    }

    // API 요청 바디 생성 예시
    const apiRequestBody = {
      requestId: Date.now(),
      data: extractedFields,
      metadata: {
        totalCount: users.length,
        extractedFields: fields,
        timestamp: new Date().toISOString(),
      },
    };
    if (IS_DEV) {
      console.log('📦 API 요청 바디:', apiRequestBody);
    }

    // 중첩된 객체에서 특정 필드만 추출
    const nestedExtraction = _.map(users, user => ({
      id: user.id,
      displayName: `${user.name} (${user.email})`,
      department: user.department,
    }));
    if (IS_DEV) {
      console.log('🔗 중첩 추출:', nestedExtraction);
      console.log('✅ [필드 추출] 완료');
    }

    return {
      originalData: users,
      selectedFields: fields,
      extractedFields: extractedFields,
      apiRequestBody: apiRequestBody,
      nestedExtraction: nestedExtraction,
    };
  };

  // 3) 데이터 원본을 변경하지 않고 복제 후 가공
  const testDataCloning = () => {
    const users = sampleData.users;

    if (IS_DEV) {
      console.log('📋 [데이터 복제] 시작');
      console.log('👥 원본 사용자 데이터:', users);
    }

    // 깊은 복사
    const clonedUsers = _.cloneDeep(users);
    if (IS_DEV) {
      console.log('📄 깊은 복사 완료:', clonedUsers);
      console.log(
        '🔍 원본과 복제본 동일성:',
        users === clonedUsers ? '❌ 참조 동일' : '✅ 독립적'
      );
    }

    // 복제된 데이터에서만 수정
    const modifiedUsers = _.map(clonedUsers, (user, index) => ({
      ...user,
      name: `${user.name} (Modified)`,
      modifiedAt: new Date().toISOString(),
      index: index,
    }));
    if (IS_DEV) {
      console.log('✏️ 복제본 수정:', modifiedUsers);
    }

    // 원본 데이터는 그대로 유지
    const originalUnchanged = users;

    // 특정 사용자만 복제하여 수정
    const specificUser = _.find(users, { id: 1 });
    const clonedSpecificUser = _.cloneDeep(specificUser);
    if (clonedSpecificUser) {
      clonedSpecificUser.name = 'John Doe (Cloned)';
      clonedSpecificUser.email = 'john.cloned@example.com';
    }
    if (IS_DEV) {
      console.log('👤 특정 사용자 복제:', clonedSpecificUser);
      console.log(
        '🔍 원본 무결성 확인:',
        originalUnchanged === users ? '✅ 보호됨' : '❌ 손상됨'
      );
      console.log('✅ [데이터 복제] 완료');
    }

    return {
      originalData: originalUnchanged,
      clonedData: clonedUsers,
      modifiedClonedData: modifiedUsers,
      specificUserClone: clonedSpecificUser,
      originalStillIntact: originalUnchanged === users, // true여야 함
    };
  };

  // 4) 데이터 그룹핑 및 집계
  const testDataGrouping = () => {
    const users = sampleData.users;
    const groupField = groupByField;

    if (IS_DEV) {
      console.log('📊 [데이터 그룹핑] 시작');
      console.log('👥 원본 사용자 데이터:', users);
      console.log('🎯 그룹핑 필드:', groupField);
    }

    // 그룹핑
    const groupedByDepartment = _.groupBy(users, groupField);
    if (IS_DEV) {
      console.log('🏢 부서별 그룹핑:', groupedByDepartment);
    }

    // 집계 데이터
    const departmentStats = _.mapValues(
      groupedByDepartment,
      (deptUsers, dept) => ({
        department: dept,
        count: deptUsers.length,
        averageAge: Math.round(_.meanBy(deptUsers, 'age')),
        youngest: _.minBy(deptUsers, 'age'),
        oldest: _.maxBy(deptUsers, 'age'),
      })
    );
    if (IS_DEV) {
      console.log('📈 부서별 통계:', departmentStats);
    }

    // 나이대별 그룹핑
    const ageGroups = _.groupBy(users, user => {
      const age = user.age;
      if (age < 30) return '20s';
      if (age < 40) return '30s';
      return '40s+';
    });
    if (IS_DEV) {
      console.log('🎂 나이대별 그룹핑:', ageGroups);
    }

    // 복합 조건 그룹핑
    const complexGrouping = _.groupBy(
      users,
      user => `${user.department}-${user.age >= 30 ? 'senior' : 'junior'}`
    );
    if (IS_DEV) {
      console.log('🔀 복합 조건 그룹핑:', complexGrouping);
      console.log('✅ [데이터 그룹핑] 완료');
    }

    return {
      originalData: users,
      groupedByField: groupedByDepartment,
      departmentStats: departmentStats,
      ageGroups: ageGroups,
      complexGrouping: complexGrouping,
    };
  };

  // 5) 중복 제거 및 정렬
  const testDeduplicationAndSorting = () => {
    // 중복 데이터가 있는 배열 생성
    const usersWithDuplicates = [
      ...sampleData.users,
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        department: 'IT',
      }, // 중복
      {
        id: 6,
        name: 'New User',
        email: 'new@example.com',
        age: 22,
        department: 'Marketing',
      },
    ];

    if (IS_DEV) {
      console.log('🔄 [중복 제거 및 정렬] 시작');
      console.log('👥 중복 포함 원본 데이터:', usersWithDuplicates);
    }

    // ID 기준 중복 제거
    const uniqueById = _.uniqBy(usersWithDuplicates, 'id');
    if (IS_DEV) {
      console.log('🆔 ID 기준 중복 제거:', uniqueById);
    }

    // 이메일 기준 중복 제거
    const uniqueByEmail = _.uniqBy(usersWithDuplicates, 'email');
    if (IS_DEV) {
      console.log('📧 이메일 기준 중복 제거:', uniqueByEmail);
    }

    // 정렬 (이름 기준)
    const sortedByName = _.sortBy(uniqueById, 'name');
    if (IS_DEV) {
      console.log('🔤 이름순 정렬:', sortedByName);
    }

    // 정렬 (나이 기준, 내림차순)
    const sortedByAgeDesc = _.orderBy(uniqueById, ['age'], ['desc']);
    if (IS_DEV) {
      console.log('🎂 나이순 정렬 (내림차순):', sortedByAgeDesc);
    }

    // 복합 정렬 (부서별, 그 다음 나이별)
    const sortedByMultipleFields = _.orderBy(
      uniqueById,
      ['department', 'age'],
      ['asc', 'desc']
    );
    if (IS_DEV) {
      console.log('🔀 복합 정렬 (부서→나이):', sortedByMultipleFields);
    }

    // 특정 조건으로 필터링 후 정렬
    const filteredAndSorted = _.orderBy(
      _.filter(uniqueById, user => user.age >= 25),
      ['department', 'name'],
      ['asc', 'asc']
    );
    if (IS_DEV) {
      console.log('🎯 필터링 후 정렬 (25세 이상):', filteredAndSorted);
      console.log('✅ [중복 제거 및 정렬] 완료');
    }

    return {
      originalWithDuplicates: usersWithDuplicates,
      uniqueById: uniqueById,
      uniqueByEmail: uniqueByEmail,
      sortedByName: sortedByName,
      sortedByAgeDesc: sortedByAgeDesc,
      sortedByMultipleFields: sortedByMultipleFields,
      filteredAndSorted: filteredAndSorted,
    };
  };

  // 6) 조건에 따른 데이터 가공 및 저장
  const testDataProcessing = () => {
    const users = sampleData.users;

    if (IS_DEV) {
      console.log('⚙️ [데이터 가공] 시작');
      console.log('👥 원본 사용자 데이터:', users);
    }

    // 조건부 데이터 가공
    const processedUsers = _.map(users, user => {
      const processedUser: any = { ...user };

      // 나이에 따른 등급 부여
      if (user.age >= 35) {
        processedUser.grade = 'Senior';
        processedUser.salary = user.age * 1000;
      } else if (user.age >= 25) {
        processedUser.grade = 'Mid';
        processedUser.salary = user.age * 800;
      } else {
        processedUser.grade = 'Junior';
        processedUser.salary = user.age * 600;
      }

      // 부서별 특별 처리
      if (user.department === 'IT') {
        processedUser.techBonus = 5000;
        processedUser.skills = ['Programming', 'System Design'];
      } else if (user.department === 'HR') {
        processedUser.hrBonus = 3000;
        processedUser.skills = ['Communication', 'Recruitment'];
      }

      // 이메일 도메인 추출
      processedUser.emailDomain = _.last(_.split(user.email, '@'));

      return processedUser;
    });
    if (IS_DEV) {
      console.log('✏️ 가공된 사용자 데이터:', processedUsers);
    }

    // 조건에 따른 분류
    const seniorUsers = _.filter(
      processedUsers,
      user => user.grade === 'Senior'
    );
    const itUsers = _.filter(processedUsers, user => user.department === 'IT');
    const highEarners = _.filter(processedUsers, user => user.salary > 30000);
    if (IS_DEV) {
      console.log('👴 시니어 사용자:', seniorUsers);
      console.log('💻 IT 부서 사용자:', itUsers);
      console.log('💰 고소득자:', highEarners);
    }

    // 집계 통계
    const statistics = {
      totalUsers: processedUsers.length,
      averageSalary: Math.round(_.meanBy(processedUsers, 'salary')),
      departmentCounts: _.countBy(processedUsers, 'department'),
      gradeCounts: _.countBy(processedUsers, 'grade'),
      totalTechBonus: _.sumBy(itUsers, 'techBonus') || 0,
      totalHrBonus:
        _.sumBy(
          _.filter(processedUsers, user => user.department === 'HR'),
          'hrBonus'
        ) || 0,
    };
    if (IS_DEV) {
      console.log('📊 집계 통계:', statistics);
    }

    // 최종 저장용 데이터 구조
    const finalDataStructure = {
      users: processedUsers,
      statistics: statistics,
      metadata: {
        processedAt: new Date().toISOString(),
        version: '1.0',
        totalProcessed: processedUsers.length,
      },
    };
    if (IS_DEV) {
      console.log('💾 최종 저장 구조:', finalDataStructure);
      console.log('✅ [데이터 가공] 완료');
    }

    return {
      originalData: users,
      processedData: processedUsers,
      seniorUsers: seniorUsers,
      itUsers: itUsers,
      highEarners: highEarners,
      statistics: statistics,
      finalDataStructure: finalDataStructure,
    };
  };

  // 7) lodashUtils.ts API 데이터 처리 함수들 테스트
  const testLodashUtilsFunctions = () => {
    const users = sampleData.users;
    const products = sampleData.products;

    if (IS_DEV) {
      console.log('🔧 [LodashUtils API 함수들] 시작');
      console.log('👥 원본 사용자 데이터:', users);
      console.log('📦 원본 상품 데이터:', products);
    }

    // 1) objectToArray - Object를 Array로 변환
    const productArray = objectToArray(products);
    if (IS_DEV) {
      console.log('📋 objectToArray 결과:', productArray);
    }

    // 2) arrayToObject - Array를 Object로 변환
    const userObject = arrayToObject(users, 'id');
    if (IS_DEV) {
      console.log('🔑 arrayToObject 결과:', userObject);
    }

    // 3) extractFields - 특정 필드만 추출
    const userFields = extractFields(users, ['id', 'name', 'email']);
    if (IS_DEV) {
      console.log('📤 extractFields 결과:', userFields);
    }

    // 4) extractAndTransform - 필드 추출 및 변환
    const transformedUsers = extractAndTransform(users, user => ({
      id: user.id,
      fullName: `${user.name} (${user.department})`,
      isSenior: user.age >= 30,
    }));
    if (IS_DEV) {
      console.log('🔄 extractAndTransform 결과:', transformedUsers);
    }

    // 5) deepClone - 깊은 복사
    const clonedUsers = deepClone(users);
    if (IS_DEV) {
      console.log('📄 deepClone 결과:', clonedUsers);
      console.log(
        '🔍 원본과 복제본 동일성:',
        users === clonedUsers ? '❌ 참조 동일' : '✅ 독립적'
      );
    }

    // 6) groupAndAggregate - 그룹핑 및 집계
    const departmentGroups = groupAndAggregate(users, 'department');
    const departmentStats = groupAndAggregate(users, 'department', group => ({
      count: group.length,
      averageAge: Math.round(
        group.reduce((sum, user) => sum + user.age, 0) / group.length
      ),
      totalAge: group.reduce((sum, user) => sum + user.age, 0),
    }));
    if (IS_DEV) {
      console.log('📊 groupAndAggregate (그룹핑):', departmentGroups);
      console.log('📈 groupAndAggregate (집계):', departmentStats);
    }

    // 7) removeDuplicates - 중복 제거
    const usersWithDuplicates = [...users, ...users.slice(0, 2)]; // 중복 추가
    const uniqueUsers = removeDuplicates(usersWithDuplicates, 'id');
    if (IS_DEV) {
      console.log('🔄 removeDuplicates 결과:', uniqueUsers);
    }

    // 8) sortData - 단일 필드 정렬
    const sortedByName = sortData(users, 'name', 'asc');
    const sortedByAge = sortData(users, 'age', 'desc');
    if (IS_DEV) {
      console.log('🔤 sortData (이름순):', sortedByName);
      console.log('🎂 sortData (나이순 내림차순):', sortedByAge);
    }

    // 9) sortDataMultiple - 복수 필드 정렬
    const multiSorted = sortDataMultiple(
      users,
      ['department', 'age'],
      ['asc', 'desc']
    );
    if (IS_DEV) {
      console.log('🔀 sortDataMultiple (부서→나이):', multiSorted);
    }

    // 10) filterData - 조건부 필터링
    const seniorUsers = filterData(users, user => user.age >= 30);
    const itUsers = filterData(users, user => user.department === 'IT');
    if (IS_DEV) {
      console.log('👴 filterData (30세 이상):', seniorUsers);
      console.log('💻 filterData (IT 부서):', itUsers);
    }

    // 11) processData - 조건부 데이터 가공
    const processedUsers = processData(users, user => ({
      ...user,
      salary: user.age * 1000,
      grade: user.age >= 30 ? 'Senior' : 'Junior',
    }));
    if (IS_DEV) {
      console.log('⚙️ processData 결과:', processedUsers);
    }

    // 12) createApiRequestBody - API 요청 바디 생성
    const apiRequest = createApiRequestBody(
      users,
      ['id', 'name', 'department'],
      {
        requestType: 'userList',
        source: 'testPage',
      }
    );
    if (IS_DEV) {
      console.log('📦 createApiRequestBody 결과:', apiRequest);
    }

    // 13) generateStatistics - 통계 생성
    const userStats = generateStatistics(users, ['age']);
    if (IS_DEV) {
      console.log('📊 generateStatistics 결과:', userStats);
    }

    // 14) findData - 데이터 검색
    const foundUser = findData(users, { id: 1 });
    const foundByEmail = findData(users, { email: 'jane@example.com' });
    if (IS_DEV) {
      console.log('🔍 findData (ID=1):', foundUser);
      console.log('📧 findData (이메일):', foundByEmail);
    }

    // 15) hasData - 데이터 존재 여부 확인
    const hasUser1 = hasData(users, { id: 1 });
    const hasUser99 = hasData(users, { id: 99 });
    if (IS_DEV) {
      console.log('✅ hasData (ID=1 존재):', hasUser1);
      console.log('❌ hasData (ID=99 존재):', hasUser99);
    }

    // 16) countData - 데이터 카운트
    const totalUsers = countData(users);
    const itUserCount = countData(users, { department: 'IT' });
    const seniorUserCount = users.filter(user => user.age >= 30).length;
    if (IS_DEV) {
      console.log('🔢 countData (전체):', totalUsers);
      console.log('💻 countData (IT 부서):', itUserCount);
      console.log('👴 countData (30세 이상):', seniorUserCount);
    }

    // 17) mergeData - 데이터 병합
    const additionalUsers = [
      {
        id: 6,
        name: 'New User',
        email: 'new@example.com',
        age: 22,
        department: 'Marketing',
      },
      {
        id: 7,
        name: 'Another User',
        email: 'another@example.com',
        age: 28,
        department: 'Sales',
      },
    ];
    const mergedUsers = mergeData(users, additionalUsers, 'id');
    if (IS_DEV) {
      console.log('🔗 mergeData 결과:', mergedUsers);
    }

    // 18) paginateData - 페이지네이션
    const paginatedResult = paginateData(users, 1, 3);
    const secondPage = paginateData(users, 2, 3);
    if (IS_DEV) {
      console.log('📄 paginateData (1페이지, 3개씩):', paginatedResult);
      console.log('📄 paginateData (2페이지, 3개씩):', secondPage);
    }

    if (IS_DEV) {
      console.log('✅ [LodashUtils API 함수들] 완료');
    }

    return {
      objectToArray: productArray,
      arrayToObject: userObject,
      extractFields: userFields,
      extractAndTransform: transformedUsers,
      deepClone: clonedUsers,
      groupAndAggregate: departmentGroups,
      groupAndAggregateStats: departmentStats,
      removeDuplicates: uniqueUsers,
      sortData: { byName: sortedByName, byAge: sortedByAge },
      sortDataMultiple: multiSorted,
      filterData: { senior: seniorUsers, it: itUsers },
      processData: processedUsers,
      createApiRequestBody: apiRequest,
      generateStatistics: userStats,
      findData: { byId: foundUser, byEmail: foundByEmail },
      hasData: { hasUser1, hasUser99 },
      countData: {
        total: totalUsers,
        it: itUserCount,
        senior: seniorUserCount,
      },
      mergeData: mergedUsers,
      paginateData: { page1: paginatedResult, page2: secondPage },
    };
  };

  // 8) 커스텀 JSON 데이터 처리
  const testCustomJsonProcessing = () => {
    if (!customJsonData.trim()) {
      return { error: '커스텀 JSON 데이터를 입력해주세요.' };
    }

    if (IS_DEV) {
      console.log('🔧 [커스텀 JSON 처리] 시작');
      console.log('📝 입력된 JSON:', customJsonData);
    }

    try {
      const customData = JSON.parse(customJsonData);
      if (IS_DEV) {
        console.log('✅ JSON 파싱 성공:', customData);
      }

      // 데이터 타입에 따른 처리
      let processedData;
      if (_.isArray(customData)) {
        // 배열인 경우
        processedData = {
          type: 'array',
          length: customData.length,
          firstItem: _.first(customData),
          lastItem: _.last(customData),
          uniqueValues: _.uniq(customData),
          sorted: _.sortBy(customData),
        };
        if (IS_DEV) {
          console.log('📋 배열 처리 결과:', processedData);
        }
      } else if (_.isObject(customData)) {
        // 객체인 경우
        processedData = {
          type: 'object',
          keys: _.keys(customData),
          values: _.values(customData),
          entries: _.toPairs(customData),
          size: _.size(customData),
        };
        if (IS_DEV) {
          console.log('🔑 객체 처리 결과:', processedData);
        }
      } else {
        processedData = {
          type: 'primitive',
          value: customData,
          typeOf: typeof customData,
        };
        if (IS_DEV) {
          console.log('🔢 원시값 처리 결과:', processedData);
        }
      }

      if (IS_DEV) {
        console.log('✅ [커스텀 JSON 처리] 완료');
      }

      return {
        originalData: customData,
        processedData: processedData,
      };
    } catch (error) {
      if (IS_DEV) {
        console.error('❌ JSON 파싱 오류:', error);
      }
      return {
        error: `JSON 파싱 오류: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  };

  // 모든 테스트 실행
  const runAllTests = () => {
    if (IS_DEV) {
      console.log('🚀 [API 데이터 처리 테스트] 전체 실행 시작');
      console.log('='.repeat(50));
    }

    const newResults: Record<string, any> = {};

    newResults.mapListConversion = testMapListConversion();
    newResults.fieldExtraction = testFieldExtraction();
    newResults.dataCloning = testDataCloning();
    newResults.dataGrouping = testDataGrouping();
    newResults.deduplicationAndSorting = testDeduplicationAndSorting();
    newResults.dataProcessing = testDataProcessing();
    newResults.lodashUtilsFunctions = testLodashUtilsFunctions();
    newResults.customJsonProcessing = testCustomJsonProcessing();

    if (IS_DEV) {
      console.log('='.repeat(50));
      console.log('🎉 [API 데이터 처리 테스트] 전체 실행 완료');
      console.log('📊 결과 요약:', {
        총_테스트_수: Object.keys(newResults).length,
        성공한_테스트: Object.values(newResults).filter(result => !result.error)
          .length,
        실패한_테스트: Object.values(newResults).filter(result => result.error)
          .length,
      });
    }

    setResults(newResults);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">API 데이터 처리 테스트 페이지</h1>
        <p className="text-muted-foreground">
          Map ↔ List 변환, 필드 추출, 데이터 가공 등의 기능을 테스트합니다.
        </p>
      </div>

      {/* 입력 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>테스트 설정</CardTitle>
          <CardDescription>
            다양한 데이터 처리 옵션을 설정하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="selectedFields">추출할 필드 (쉼표로 구분)</Label>
              <Input
                id="selectedFields"
                value={selectedFields}
                onChange={e => setSelectedFields(e.target.value)}
                placeholder="id,name,email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groupByField">그룹핑 필드</Label>
              <Input
                id="groupByField"
                value={groupByField}
                onChange={e => setGroupByField(e.target.value)}
                placeholder="department"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortField">정렬 필드</Label>
              <Input
                id="sortField"
                value={sortField}
                onChange={e => setSortField(e.target.value)}
                placeholder="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterCondition">필터 조건</Label>
              <Input
                id="filterCondition"
                value={filterCondition}
                onChange={e => setFilterCondition(e.target.value)}
                placeholder="age > 30"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customJsonData">커스텀 JSON 데이터</Label>
            <Textarea
              id="customJsonData"
              value={customJsonData}
              onChange={e => setCustomJsonData(e.target.value)}
              placeholder='{"key": "value", "array": [1, 2, 3]}'
              rows={4}
            />
          </div>
          <Button onClick={runAllTests} className="w-full">
            모든 테스트 실행
          </Button>
        </CardContent>
      </Card>

      {/* 결과 섹션 */}
      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">테스트 결과</h2>

          {/* 1) Map ↔ List 변환 */}
          {results.mapListConversion && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">1</Badge>
                  Map(Object) ↔ List(Array) 변환 + 값 수정
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <strong>원본 Object:</strong>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                      {JSON.stringify(
                        results.mapListConversion.originalObject,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <div>
                    <strong>Object → Array 변환:</strong>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                      {JSON.stringify(
                        results.mapListConversion.convertedToList,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <div>
                    <strong>값 수정 후 (10% 할인):</strong>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                      {JSON.stringify(
                        results.mapListConversion.modifiedList,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <div>
                    <strong>Array → Object 변환:</strong>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                      {JSON.stringify(
                        results.mapListConversion.convertedBackToObject,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 2) 필드 추출 */}
          {results.fieldExtraction && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">2</Badge>
                  JSON에서 일부 필드만 추출
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <strong>선택된 필드:</strong>{' '}
                    {results.fieldExtraction.selectedFields.join(', ')}
                  </div>
                  <div>
                    <strong>추출된 필드:</strong>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                      {JSON.stringify(
                        results.fieldExtraction.extractedFields,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <div>
                    <strong>API 요청 바디:</strong>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                      {JSON.stringify(
                        results.fieldExtraction.apiRequestBody,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3) 데이터 복제 */}
          {results.dataCloning && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">3</Badge>
                  데이터 복제 및 원본 보호
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <strong>원본 데이터 (수정 전):</strong>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                      {JSON.stringify(
                        results.dataCloning.originalData[0],
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <div>
                    <strong>복제된 데이터 (수정 후):</strong>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                      {JSON.stringify(
                        results.dataCloning.modifiedClonedData[0],
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <div>
                    <strong>원본 데이터 무결성:</strong>{' '}
                    {results.dataCloning.originalStillIntact
                      ? '✅ 보호됨'
                      : '❌ 손상됨'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 4) 데이터 그룹핑 */}
          {results.dataGrouping && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">4</Badge>
                  데이터 그룹핑 및 집계
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <strong>부서별 그룹핑:</strong>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                      {JSON.stringify(
                        results.dataGrouping.groupedByField,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <div>
                    <strong>부서별 통계:</strong>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                      {JSON.stringify(
                        results.dataGrouping.departmentStats,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <div>
                    <strong>나이대별 그룹핑:</strong>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                      {JSON.stringify(results.dataGrouping.ageGroups, null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 5) 중복 제거 및 정렬 */}
          {results.deduplicationAndSorting && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">5</Badge>
                  중복 제거 및 정렬
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <strong>중복 제거 (ID 기준):</strong>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                      {JSON.stringify(
                        results.deduplicationAndSorting.uniqueById,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <div>
                    <strong>이름순 정렬:</strong>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                      {JSON.stringify(
                        results.deduplicationAndSorting.sortedByName,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <div>
                    <strong>나이순 정렬 (내림차순):</strong>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                      {JSON.stringify(
                        results.deduplicationAndSorting.sortedByAgeDesc,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 6) 데이터 가공 */}
          {results.dataProcessing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">6</Badge>
                  조건부 데이터 가공 및 저장
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <strong>가공된 데이터 (일부):</strong>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                      {JSON.stringify(
                        results.dataProcessing.processedData.slice(0, 2),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <div>
                    <strong>통계 정보:</strong>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                      {JSON.stringify(
                        results.dataProcessing.statistics,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <div>
                    <strong>최종 저장 구조:</strong>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                      {JSON.stringify(
                        results.dataProcessing.finalDataStructure,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 7) LodashUtils API 함수들 */}
          {results.lodashUtilsFunctions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">7</Badge>
                  LodashUtils API 데이터 처리 함수들
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Object ↔ Array 변환 */}
                  <div>
                    <h4 className="font-semibold mb-2">Object ↔ Array 변환</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <strong>objectToArray (상품):</strong>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                          {JSON.stringify(
                            results.lodashUtilsFunctions.objectToArray,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                      <div>
                        <strong>arrayToObject (사용자):</strong>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                          {JSON.stringify(
                            results.lodashUtilsFunctions.arrayToObject,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* 필드 추출 및 변환 */}
                  <div>
                    <h4 className="font-semibold mb-2">필드 추출 및 변환</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <strong>extractFields:</strong>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                          {JSON.stringify(
                            results.lodashUtilsFunctions.extractFields,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                      <div>
                        <strong>extractAndTransform:</strong>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                          {JSON.stringify(
                            results.lodashUtilsFunctions.extractAndTransform,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* 그룹핑 및 집계 */}
                  <div>
                    <h4 className="font-semibold mb-2">그룹핑 및 집계</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <strong>groupAndAggregate (그룹핑):</strong>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                          {JSON.stringify(
                            results.lodashUtilsFunctions.groupAndAggregate,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                      <div>
                        <strong>groupAndAggregate (집계):</strong>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                          {JSON.stringify(
                            results.lodashUtilsFunctions.groupAndAggregateStats,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* 정렬 */}
                  <div>
                    <h4 className="font-semibold mb-2">정렬</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <strong>sortData (이름순):</strong>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                          {JSON.stringify(
                            results.lodashUtilsFunctions.sortData.byName,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                      <div>
                        <strong>sortDataMultiple (부서→나이):</strong>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                          {JSON.stringify(
                            results.lodashUtilsFunctions.sortDataMultiple,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* 필터링 및 가공 */}
                  <div>
                    <h4 className="font-semibold mb-2">필터링 및 가공</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <strong>filterData (시니어):</strong>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                          {JSON.stringify(
                            results.lodashUtilsFunctions.filterData.senior,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                      <div>
                        <strong>processData:</strong>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                          {JSON.stringify(
                            results.lodashUtilsFunctions.processData,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* API 요청 및 통계 */}
                  <div>
                    <h4 className="font-semibold mb-2">API 요청 및 통계</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <strong>createApiRequestBody:</strong>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                          {JSON.stringify(
                            results.lodashUtilsFunctions.createApiRequestBody,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                      <div>
                        <strong>generateStatistics:</strong>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                          {JSON.stringify(
                            results.lodashUtilsFunctions.generateStatistics,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* 검색 및 카운트 */}
                  <div>
                    <h4 className="font-semibold mb-2">검색 및 카운트</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <strong>findData:</strong>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                          {JSON.stringify(
                            results.lodashUtilsFunctions.findData,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                      <div>
                        <strong>countData:</strong>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                          {JSON.stringify(
                            results.lodashUtilsFunctions.countData,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* 병합 및 페이지네이션 */}
                  <div>
                    <h4 className="font-semibold mb-2">병합 및 페이지네이션</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <strong>mergeData:</strong>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                          {JSON.stringify(
                            results.lodashUtilsFunctions.mergeData,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                      <div>
                        <strong>paginateData (1페이지):</strong>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                          {JSON.stringify(
                            results.lodashUtilsFunctions.paginateData.page1,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 8) 커스텀 JSON 처리 */}
          {results.customJsonProcessing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">8</Badge>
                  커스텀 JSON 데이터 처리
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.customJsonProcessing.error ? (
                  <div className="text-red-600">
                    <strong>오류:</strong> {results.customJsonProcessing.error}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <strong>원본 데이터:</strong>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                        {JSON.stringify(
                          results.customJsonProcessing.originalData,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                    <div>
                      <strong>처리된 데이터:</strong>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                        {JSON.stringify(
                          results.customJsonProcessing.processedData,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiDataTestPage;
